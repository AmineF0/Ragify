Project Documentation
=====================

.. contents::
   :local:
   :depth: 2

Project Overview
----------------

This project is a **Profile Management API** built using FastAPI, designed to manage Language Model (LLM) profiles for Retrieval-Augmented Generation (RAG) and base models. It supports both English and Arabic languages and integrates with **Ollama** for model management and embeddings.

**Key Features**

- **Profile Management**: Create, retrieve, and manage LLM profiles.
- **Retrieval-Augmented Generation (RAG)**: Enhance model responses by providing context from PDFs and text documents.
- **Multi-Language Support**: Supports English and Arabic languages with tailored prompts.
- **Model Integration**: Fetch and use various models via the Ollama API.

How the Project Works
---------------------

### Components

1. **Backend (`be`)**:
   - **FastAPI Application**: Provides API endpoints for profile management.
   - **LLM Profiles**: Manages profiles using the `Profile` class from `LLM_profile.py`.
   - **Integration with Ollama**: Communicates with Ollama for model information and embeddings.
   - **CORS Support**: Allows cross-origin requests for broader accessibility.

2. **Frontend (`fe`)**:
   - While the frontend code isn't provided, it's implied to interact with the backend API to offer a user interface for profile management.

### Workflow

1. **Fetching Available Models**:
   - The `/models` endpoint retrieves a list of models available in Ollama.

2. **Profile Management**:
   - **Create Profiles** (`POST /profiles`): Users can create new profiles with specific configurations.
   - **Retrieve Profiles** (`GET /profiles`): Lists all available profiles.

3. **Uploading Files to Profiles**:
   - **Upload Files** (`POST /profiles/{profile_name}/files`): Users can upload PDF files to enhance the model's context.

4. **Querying Profiles**:
   - **Query** (`POST /profiles/{profile_name}/query`): Users can send queries to a specific profile to get responses based on the profile's context and model.

### LLM Profiles

- **Base Profiles**: Use the model as-is without additional context.
- **RAG-txt Profiles**: Trained with additional text content provided during profile creation.
- **RAG-pdf Profiles**: Trained with PDFs uploaded to the profile, allowing the model to reference specific documents.

Running the Project
-------------------

### Prerequisites

- **Docker** and **Docker Compose** installed.
- **Python 3.x** (if running without Docker).
- **Ollama** installed and running, accessible via the base URL specified in the environment variables.

### Docker Compose Configuration

The `docker-compose.yml` file defines two services:

.. code-block:: yaml

   version: '3.8'

   services:
     be:
       build:
         context: ./be
         dockerfile: dockerfile
       ports:
         - "8000:8000"
       env_file:
         - .env

     fe:
       build:
         context: ./fe
         dockerfile: dockerfile
       ports:
         - "3000:3000"
       env_file:
         - .env

### Steps to Run the Project

1. **Clone the Repository**:

   .. code-block:: bash

      git clone https://github.com/yourusername/yourproject.git
      cd yourproject

2. **Set Up Environment Variables**:

   - Create a `.env` file in both `./be` and `./fe` directories or in the root directory.
   - Define the necessary environment variables. For example:

     .. code-block:: ini

        # .env file
        BASE_URL=http://127.0.0.1:11434
        PROFILES_FILE=models/profiles.json

3. **Build and Run the Services**:

   .. code-block:: bash

      docker-compose up --build

   - This command builds the Docker images and starts both the backend and frontend services.
   - The backend will be available at `http://localhost:8000`.
   - The frontend will be available at `http://localhost:3000`.

4. **Verify the Backend**:

   - Access the API documentation at `http://localhost:8000/docs` to explore the available endpoints and test them interactively.

5. **Interact with the Frontend**:

   - Open your web browser and navigate to `http://localhost:3000` to use the frontend interface (assuming it's properly set up in the `./fe` directory).

6. **Use the API Endpoints**:

   - **Fetch Models**: Send a `GET` request to `/models` to retrieve available models.
   - **Create a Profile**: Use the `/profiles` endpoint to create a new profile by providing the necessary form data.
   - **Upload Files to a Profile**: Use `/profiles/{profile_name}/files` to upload PDFs.
   - **Query a Profile**: Send queries to `/profiles/{profile_name}/query` to get responses.

Arabic Support and Ollama
-------------------------

### Arabic Language Support

- **Prompts**: The application includes specific prompts for Arabic language support in the `Prompts` class within `LLM_profile.py`.
- **Language Selection**: When creating a profile, you can specify the language by setting the `language` parameter to `LANGUAGES.ARABIC` (`"ar"`).
- **Context Handling**: The system adjusts the prompts and context handling based on the selected language, ensuring accurate responses in Arabic.

### Ollama Integration

- **Base URL Configuration**: Ollama's API base URL is set via the `BASE_URL` environment variable (default is `http://127.0.0.1:11434`).
- **Model Management**: The application interacts with Ollama to fetch available models and perform operations like embeddings and querying.
- **Embeddings and LLM**: Uses `OllamaEmbeddings` for embedding functions and `Ollama` for LLM interactions.

Supported Models
----------------

The application supports multiple models, including ones specialized for Arabic language processing.

### List of Models

.. code-block:: json

   "models": [
       "aya-expanse:latest",        // Arabic
       "mistral:latest",            // Optional
       "0ssamaak0/silma-v1:latest", // Arabic
       "gemma:latest",              // Optional
       "llama3.2:latest",
       "llama3.1:latest"            // English
   ]

### Model Descriptions

- **"aya-expanse:latest"**:
  - An Arabic language model designed for expansive and context-rich responses.
- **"0ssamaak0/silma-v1:latest"**:
  - A specialized Arabic model fine-tuned for specific use cases.
- **"mistral:latest"** and **"gemma:latest"**:
  - Optional models that can be included based on your requirements.
- **"llama3.2:latest"** and **"llama3.1:latest"**:
  - English language models suitable for general-purpose tasks.

### Using Models with Ollama

1. **Install Ollama**:

   - Follow the instructions on the `Ollama website <https://ollama.ai/>`_ to install and set up Ollama on your machine.

2. **Install Models**:

   .. code-block:: bash

      ollama pull aya-expanse:latest
      ollama pull 0ssamaak0/silma-v1:latest
      ollama pull llama3.1:latest
      # Add other models as needed

3. **Verify Models**:

   .. code-block:: bash

      ollama list

4. **Configure the Application**:

   - The application will automatically fetch the available models from Ollama when you access the `/models` endpoint.

Additional Notes
----------------

### Environment Variables

- **BASE_URL**: The base URL for the Ollama API (default is `http://127.0.0.1:11434`).
- **PROFILES_FILE**: Path to the JSON file where profiles are stored (default is `models/profiles.json`).

### Logging

- The application uses Python's built-in `logging` module to provide detailed logs at various levels (`DEBUG`, `INFO`, `ERROR`).
- Logs are helpful for debugging and monitoring the application's behavior.

### File Storage

- Uploaded files and generated data are stored in the `files` and `models` directories, respectively.
- Ensure that these directories are writable by the application and persist across container restarts if using Docker volumes.

### Error Handling

- The API endpoints include error handling to provide meaningful HTTP responses when issues occur (e.g., `404 Not Found`, `500 Internal Server Error`).

### CORS Configuration

- Cross-Origin Resource Sharing (CORS) is configured to allow all origins. Adjust the `allow_origins` parameter in `app.add_middleware` if you need to restrict access.

Conclusion
----------

This project provides a robust API for managing language model profiles with support for both English and Arabic languages. By leveraging Ollama for model management and embeddings, and integrating RAG techniques, it enhances the capabilities of LLMs to provide context-aware and language-specific responses.

**Key Takeaways**

- **Easy Profile Management**: Create and manage profiles tailored to specific needs.
- **Enhanced Responses with RAG**: Improve model outputs by providing additional context through documents.
- **Multi-Language Support**: Seamlessly switch between English and Arabic.
- **Flexible Deployment**: Run the application using Docker for consistent and isolated environments.

**Feel free to reach out if you have any questions or need further assistance with setting up or using the project!**
