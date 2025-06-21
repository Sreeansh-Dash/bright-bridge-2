# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set environment variables
ENV PYTHONUNBUFFERED=1 
    PORT=8080

# Set the working directory in the container
WORKDIR /brightbridgeDir

# Copy the current directory contents into the container at /brightbridgeDir
COPY . /brightbridgeDir

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port your application listens on (e.g., 8080 for Cloud Run)
EXPOSE 8080

# Run your application when the container launches
CMD ["python", "bridgebright/agent.py"]
