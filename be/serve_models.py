"""
Profile Management API using FastAPI.

This module provides endpoints for managing profiles, including creating new profiles,
uploading files to profiles, and querying profiles.

Dependencies:
    - FastAPI
    - LLM_profile (Profile class)
    - Other necessary Python standard libraries and third-party packages.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import uuid
import shutil
from LLM_profile import Profile, LANGUAGES  # Importing LANGUAGES
import logging
from dotenv import load_dotenv
import requests
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="Profile Management API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize profiles by loading existing ones
Profile.load_profiles()


@app.get("/models")
async def get_available_models():
    """
    Fetches a list of available models from the Ollama API.

    Returns:
        dict: A dictionary containing a list of model names.
    """
    try:
        base_url = os.getenv("BASE_URL", "http://127.0.0.1:11434")
        response = requests.get(f'{base_url}/api/tags')
        response.raise_for_status()
        models_data = response.json().get("models", [])
        models = [model['model'] for model in models_data]
        logger.info(f"Fetched {len(models)} models")
        return {"models": models}
    except Exception as e:
        logger.error(f"Error fetching models: {e}")
        raise HTTPException(status_code=500, detail="Unable to fetch models")


@app.get("/profiles")
async def get_available_profiles():
    """
    Retrieves a list of available profiles.

    Returns:
        dict: A dictionary containing a list of profiles.
    """
    profiles = [profile.serialize() for profile in Profile.Profiles]
    logger.info(f"Retrieved {len(profiles)} profiles")
    return {"profiles": profiles}


@app.post("/profiles")
async def add_new_profile(
    name: str = Form(...),
    model: str = Form(...),
    prompt: str = Form(...),
    description: Optional[str] = Form(""),
    text_content: Optional[str] = Form(None),
    train: bool = Form(False),
    use_only_context: bool = Form(False),
    language: str = Form(LANGUAGES.ENGLISH),
    files: Optional[List[UploadFile]] = File(None)
):
    """
    Creates a new profile with the provided data.

    Args:
        name (str): Profile name.
        model (str): Model identifier.
        prompt (str): Prompt used with the model.
        description (str, optional): Profile description.
        text_content (str, optional): Text content to train the model.
        train (bool, optional): Whether to train the profile on initialization.
        use_only_context (bool, optional): Use only context for answers.
        language (str, optional): Language code ("en" or "ar").
        files (List[UploadFile], optional): List of files to upload.

    Returns:
        JSONResponse: A message indicating success or failure.
    """
    try:
        logger.info(f"Adding new profile '{name}'")
        logger.info(f"Profile data: name={name}, model={model}, prompt={prompt}, "
                    f"description={description}, text_content={'Yes' if text_content else 'No'}, "
                    f"train={train}, use_only_context={use_only_context}, language={language}, "
                    f"files={'Yes' if files else 'No'}")

        if not files:
            text_content = text_content or ""

        type = "Base"
        files_path = []
        profile_dir = None
        train = True

        # Generate a unique directory for storing files
        profile_uuid = f"{name}_{uuid.uuid4()}"
        profile_dir = os.path.join("files", profile_uuid)
        os.makedirs(profile_dir, exist_ok=True)
        logger.info(f"Created directory '{profile_dir}' for profile '{name}'")

        # Handle text content
        if text_content:
            type = "RAG-txt"
            text_file_path = os.path.join(profile_dir, f"{uuid.uuid4()}.txt")
            with open(text_file_path, "w") as text_file:
                text_file.write(text_content)
            files_path.append(text_file_path)
            logger.info(f"Saved text content to '{text_file_path}'")

        # Handle file uploads
        if files:
            type = "RAG-pdf"
            for uploaded_file in files:
                file_extension = os.path.splitext(uploaded_file.filename)[1]
                new_filename = f"{uuid.uuid4()}{file_extension}"
                file_path = os.path.join(profile_dir, new_filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(uploaded_file.file, buffer)
                files_path.append(file_path)
                logger.info(f"Saved uploaded file to '{file_path}'")

        # Add the new profile
        Profile.add_profile(
            name=name,
            model=model,
            prompt=prompt,
            description=description,
            type=type,
            files_path=files_path,
            train=train,
            use_only_context=use_only_context,
            language=language,
        )
        logger.info(f"Profile '{name}' added successfully")
        return JSONResponse(status_code=201, content={"message": f"Profile '{name}' added successfully"})
    except Exception as e:
        logger.error(f"Error adding profile '{name}': {e}")
        raise HTTPException(status_code=500, detail="Unable to add profile")


@app.post("/profiles/{profile_name}/files")
async def upload_files(profile_name: str, files: List[UploadFile] = File(...)):
    """
    Uploads files for the specified profile.

    Args:
        profile_name (str): The name of the profile to upload files to.
        files (List[UploadFile]): List of files to upload.

    Returns:
        JSONResponse: A message indicating success or failure.
    """
    try:
        logger.info(f"Uploading files for profile '{profile_name}'")
        profile = Profile.get_profile(profile_name)
        if not profile:
            logger.error(f"Profile '{profile_name}' not found")
            raise HTTPException(status_code=404, detail="Profile not found")

        if profile.type != "RAG-pdf":
            logger.error(f"Profile '{profile_name}' is not of type 'RAG-pdf'")
            raise HTTPException(status_code=400, detail="Profile is not of type 'RAG-pdf'")

        profile_dir = profile.profile_dir
        if not profile_dir:
            logger.error(f"Profile directory for '{profile_name}' not found")
            raise HTTPException(status_code=500, detail="Profile directory not found")

        os.makedirs(profile_dir, exist_ok=True)
        files_path = profile.files_path or []

        for uploaded_file in files:
            file_extension = os.path.splitext(uploaded_file.filename)[1]
            new_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(profile_dir, new_filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(uploaded_file.file, buffer)
            files_path.append(file_path)
            logger.info(f"Saved uploaded file to '{file_path}'")

        # Update the profile's files_path and save profiles
        profile.files_path = files_path
        Profile.save_profiles()  # Save the updated profile data

        # Retrain the profile
        profile.train_profile()
        logger.info(f"Profile '{profile_name}' retrained with new files")
        return JSONResponse(status_code=200, content={"message": f"Files uploaded and profile '{profile_name}' updated successfully"})
    except Exception as e:
        logger.error(f"Error uploading files for profile '{profile_name}': {e}")
        raise HTTPException(status_code=500, detail="Unable to upload files")


@app.post("/profiles/{profile_name}/query")
async def query_profile(profile_name: str, query: str = Form(...)):
    """
    Queries a profile with the provided input.

    Args:
        profile_name (str): The name of the profile to query.
        query (str): The input query string.

    Returns:
        dict: The response from the profile.
    """
    try:
        logger.info(f"Querying profile '{profile_name}' with input: {query}")
        response = Profile.query_profile(profile_name, query)
        if response == "Profile not found":
            logger.error(f"Profile '{profile_name}' not found")
            raise HTTPException(status_code=404, detail="Profile not found")
        logger.debug(f"Response from profile '{profile_name}': {response}")
        return {"response": response}
    except Exception as e:
        logger.error(f"Error querying profile '{profile_name}': {e}")
        raise HTTPException(status_code=500, detail="Unable to query profile")
