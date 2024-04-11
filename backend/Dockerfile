# # Use an official Python runtime as a parent image
# FROM python:3.9

# # Set the working directory in the container
# WORKDIR /backend

# # Copy the backend directory contents into the container at /backend
# COPY backend/ .

# # Install any needed packages specified in requirements.txt
# RUN pip install --no-cache-dir -r requirements.txt

# # Make port 5000 available to the world outside this container
# EXPOSE 5000

# # Run app.py when the container launches
# CMD ["python3", "app.py"]
# Use an official Python runtime as a parent image
FROM python:3.9

# Set the working directory in the container
WORKDIR /backend

# Copy the backend directory contents into the container at /backend
COPY backend/ .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install PostgreSQL
RUN apt-get update && \
    apt-get install -y postgresql postgresql-contrib

# Create a PostgreSQL user and database
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER test WITH SUPERUSER PASSWORD 'test';" && \
    createdb -O test register

# Switch back to the root user
USER root

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run app.py when the container launches
CMD ["python3", "app.py"]
