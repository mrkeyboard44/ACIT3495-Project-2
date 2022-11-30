FROM python:3

# add curl for healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the application directory
WORKDIR /app

# Install our requirements.txt
COPY src/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Copy our code from the current folder to /app inside the container
COPY src .

# Make port 8090 available for dev access
EXPOSE 8090

# Define our command to be run when launching the container
ENTRYPOINT [ "python3" ]
CMD [ "main.py" ]