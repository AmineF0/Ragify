import os
import json
import logging
from dotenv import load_dotenv
from langchain_community.llms import Ollama
from langchain_community.embeddings import OllamaEmbeddings
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Prompts:
    """
    Collection of constant prompts used in the LLM profiles.
    """
    QA_ENGLISH_ONLY_CONTEXT = """
    Answer any user questions based solely on the context below, answer only in English:
    """

    QA_ENGLISH = """
    Answer any user questions based on the context but also consider your knowledge, answer only in English:
    """

    QA_ONLY_ARABIC_ONLY_CONTEXT = """
    أجب على أي سؤال استخدم فقط السياق أدناه, الجواب باللغة العربية فقط:
    """

    QA_ONLY_ARABIC = """
    أجب على أي سؤال استخدم السياق ولكن اعتبر معرفتك أيضًا, الجواب باللغة العربية فقط:
    """

class LANGUAGES:
    """
    Language codes used in the LLM profiles.
    """
    ENGLISH = "en"
    ARABIC = "ar"

class Profile:
    """
    Manages LLM profiles for Retrieval-Augmented Generation (RAG) and base models.

    Attributes:
        PROFILES_FILE (str): Path to the profiles JSON file.
        BASE_URL (str): Base URL for the LLM and embeddings.
        Profiles (list): A list of all loaded profiles.
    """

    PROFILES_FILE = os.getenv("PROFILES_FILE", "models/profiles.json")
    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:11434")
    Profiles = []

    def __init__(
        self,
        name,
        model,
        prompt,
        description="",
        file_path=None,
        type="Base",
        files_path=None,
        train=False,
        use_only_context=False,
        language=LANGUAGES.ENGLISH
    ):
        """
        Initializes a Profile instance.

        Args:
            name (str): Profile name.
            model (str): Model identifier.
            prompt (str): Prompt used with the model.
            description (str, optional): Profile description.
            file_path (str, optional): Path to the profile file.
            type (str, optional): Model type ("RAG-pdf", "Base", "RAG-txt").
            files_path (list, optional): Paths to training files.
            train (bool, optional): Whether to train the profile on initialization.
            use_only_context (bool, optional): Use only context for answers.
            language (str, optional): Language code ("en" or "ar").
        """
        self.name = name
        self.model = model
        self.llm = None
        self.embed_model = None
        self.vector_store = None
        self.retriever = None
        self.retrieval_chain = None
        self.prompt = prompt
        self.description = description
        self.file_path = file_path
        self.chroma_path = os.path.join("models", self.name)
        self.files_path = files_path or []
        self.type = type
        self.use_only_context = use_only_context
        self.language = language

        self.initialize_profile(train)

    # Class methods for profile management
    @classmethod
    def load_profiles(cls):
        """Loads profiles from the profiles JSON file."""
        if os.path.exists(cls.PROFILES_FILE):
            logger.info(f"Loading profiles from '{cls.PROFILES_FILE}'")
            with open(cls.PROFILES_FILE, "r") as f:
                profiles_data = json.load(f)
                cls.Profiles = [cls(**profile) for profile in profiles_data]
        else:
            logger.warning(f"Profiles file '{cls.PROFILES_FILE}' does not exist")
            cls.Profiles = []

    @classmethod
    def save_profiles(cls):
        """Saves profiles to the profiles JSON file."""
        try:
            logger.info(f"Saving profiles to '{cls.PROFILES_FILE}'")
            with open(cls.PROFILES_FILE, "w") as f:
                json.dump([profile.serialize() for profile in cls.Profiles], f)
        except Exception as e:
            logger.error(f"Error saving profiles: {e}")

    @classmethod
    def add_profile_instance(cls, profile):
        """Adds a profile instance to the profiles list and saves it."""
        cls.Profiles.append(profile)
        cls.save_profiles()

    @classmethod
    def add_profile(
        cls,
        name,
        model,
        prompt,
        description="",
        file_path=None,
        type="Base",
        files_path=None,
        train=False,
        use_only_context=False,
        language=LANGUAGES.ENGLISH
    ):
        """Creates and adds a new profile."""
        profile = cls(
            name,
            model,
            prompt,
            description,
            file_path,
            type,
            files_path,
            train,
            use_only_context,
            language
        )
        cls.add_profile_instance(profile)

    @classmethod
    def get_profile(cls, name):
        """Retrieves a profile by name."""
        for profile in cls.Profiles:
            if profile.name == name:
                return profile
        logger.warning(f"Profile '{name}' not found")
        return None

    @classmethod
    def query_profile(cls, name, query):
        """Queries a profile by name with the given input."""
        profile = cls.get_profile(name)
        if profile:
            return profile.query(query)
        logger.error(f"Profile '{name}' not found")
        return "Profile not found"

    # Instance methods for initialization and training
    def initialize_profile(self, train=False):
        """Initializes the profile's model and components."""
        logger.info(f"Initializing profile '{self.name}' with model '{self.model}'")
        self._initialize_model()
        if train:
            self.train_profile()
        else:
            self._load_vector_store()
        self._initialize_retriever()
        self._create_retrieval_chain()

    def _initialize_model(self):
        """Initializes the LLM and embedding model instances."""
        logger.debug(f"Initializing LLM and embeddings for profile '{self.name}'")
        self.llm = Ollama(model=self.model, base_url=self.BASE_URL)
        self.embed_model = OllamaEmbeddings(model=self.model, base_url=self.BASE_URL)

    def _load_vector_store(self):
        """Loads the vector store from the specified directory."""
        if os.path.exists(self.chroma_path):
            logger.info(f"Loading vector store from '{self.chroma_path}'")
            self.vector_store = Chroma(
                persist_directory=self.chroma_path,
                embedding_function=self.embed_model
            )
        else:
            logger.warning(f"Vector store at '{self.chroma_path}' does not exist")
            self.vector_store = None

    def _initialize_retriever(self):
        """Initializes the retriever from the vector store."""
        if self.vector_store:
            logger.debug(f"Initializing retriever for profile '{self.name}'")
            self.retriever = self.vector_store.as_retriever()
        else:
            logger.error(f"Vector store not loaded for profile '{self.name}'")
            self.retriever = None

    def _create_prompt(self, prompt):
        """Creates a prompt template based on language and context settings."""
        try:
            if self.language == LANGUAGES.ARABIC:
                default_prompt = (
                    Prompts.QA_ONLY_ARABIC_ONLY_CONTEXT if self.use_only_context else Prompts.QA_ONLY_ARABIC
                )
            else:
                default_prompt = (
                    Prompts.QA_ENGLISH_ONLY_CONTEXT if self.use_only_context else Prompts.QA_ENGLISH
                )
            
            logging.info(f"default_prompt message: {default_prompt}")
            logging.info(f"prompt message: {prompt}")

            system_message = SystemMessagePromptTemplate.from_template(
                template=f"{default_prompt}\n{prompt}\n"+"<context> {context} </context>"
            )

            human_message = HumanMessagePromptTemplate.from_template("{input}")

            prompt_template = ChatPromptTemplate.from_messages(
                messages=[system_message, human_message]
            )
            
            return prompt_template
        except Exception as e:
            logger.error(f"Error creating prompt: {e}")
            prompt_template = None
            return prompt_template

    def _create_retrieval_chain(self):
        """Creates the retrieval chain for the profile."""
        if self.retriever is None:
            logger.error(f"Cannot create retrieval chain; retriever is None for profile '{self.name}'")
            self.retrieval_chain = None
            return

        self.retriever_prompt = self._create_prompt(self.prompt)
        if self.type in ["RAG-pdf", "RAG-txt"]:
            combine_docs_chain = create_stuff_documents_chain(self.llm, self.retriever_prompt)
            self.retrieval_chain = create_retrieval_chain(
                retriever=self.retriever,
                combine_docs_chain=combine_docs_chain
            )
            logger.info(f"Retrieval chain created for profile '{self.name}'")
        else:
            logger.info(f"No retrieval chain required for profile type '{self.type}'")
            self.retrieval_chain = None

    def train_profile(self):
        """Trains the profile based on its type."""
        if self.type == "RAG-pdf":
            logger.info(f"Training RAG-pdf profile '{self.name}'")
            self._train_pdf_profile()
        elif self.type == "RAG-txt":
            logger.info(f"Training RAG-txt profile '{self.name}'")
            self._train_txt_profile()
        else:
            logger.warning(f"Training not supported for profile type '{self.type}'")

    def _train_pdf_profile(self):
        """Trains a profile using PDF documents."""
        documents = []
        for pdf_path in self.files_path:
            logger.debug(f"Loading PDF file '{pdf_path}'")
            loader = PyPDFLoader(pdf_path)
            documents.extend(loader.load())
            
        base_chunk_size = 1000
        base_overlap = 100
        
        doc_lengths = [len(doc.page_content) for doc in documents if hasattr(doc, 'page_content')]

        avg_length = sum(doc_lengths) / len(doc_lengths) if doc_lengths else base_chunk_size
        
        # Adjust parameters dynamically
        chunk_size = min(max(int(avg_length * 0.8), 1000), base_chunk_size)
        overlap = min(max(int(chunk_size * 0.1), 100), base_overlap)

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
        chunks = text_splitter.split_documents(documents)

        self.vector_store = Chroma.from_documents(
            chunks,
            embedding=self.embed_model,
            persist_directory=self.chroma_path
        )
        
        logger.info(f"Vector store created at '{self.chroma_path}'")

    def _train_txt_profile(self):
        """Trains a profile using text documents."""
        all_text = ''
        for text_file in self.files_path:
            logger.debug(f"Loading text file '{text_file}'")
            with open(text_file, 'r') as f:
                all_text += f.read()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_text(all_text)

        self.vector_store = Chroma.from_texts(
            chunks,
            embedding=self.embed_model,
            persist_directory=self.chroma_path
        )
        logger.info(f"Vector store created at '{self.chroma_path}'")

    # Query handling
    def query(self, query):
        """Performs a query using the profile.

        Args:
            query (str): The input query.

        Returns:
            str: The response from the model or an error message.
        """
        if not self.retrieval_chain:
            logger.error(f"Profile '{self.name}' is not initialized or retrieval chain is missing")
            return "Profile is not initialized"

        logger.info(f"Querying profile '{self.name}' with input: {query}")
        return self.retrieval_chain.invoke({"input": query})

    # Serialization and representation
    def serialize(self):
        """Serializes the profile for saving to JSON."""
        return {
            "name": self.name,
            "model": self.model,
            "prompt": self.prompt,
            "description": self.description,
            "file_path": self.file_path,
            "files_path": self.files_path,
            "type": self.type,
            "use_only_context": self.use_only_context,
            "language": self.language
        }

    def __str__(self):
        """Returns a string representation of the profile."""
        return f"Profile: {self.name} - {self.description} - {self.type}"
