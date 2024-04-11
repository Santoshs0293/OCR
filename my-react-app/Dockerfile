# Use an official Node runtime as a parent image
FROM node:12

# Set the working directory in the container
WORKDIR /my-react-app

# Copy the package.json and package-lock.json separately to leverage Docker cache
COPY my-react-app/ .


# Install node dependencies
RUN npm install

# Copy the rest of the frontend directory contents into the container
COPY my-react-app/ .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run npm start when the container launches
CMD ["npm", "start"]
