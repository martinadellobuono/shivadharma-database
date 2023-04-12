# Śivadharma Database Project

**Śivadharma Database** is a [Neo4j](https://neo4j.com/) web application built in [Node.js](https://nodejs.org/en/). 
The project is ongoing and under development.

## Quick start

Clone this repository using the URL https://github.com/martinadellobuono/shivadharma-neo4j.git
or download the folder.

The project works with these ***requirements***:

- [**Node.js**](https://nodejs.org/en/) v16.14.2
- [**Neo4j**](https://neo4j.com/download/) @4.4.1

Packages can be installed by running **setup.sh**.

After installing the required packages:

- Download **Neo4j Desktop**: https://neo4j.com/download/
- Create a new **Project**
- Click on the **Add** button
- Select **Local DBMS**
- Set **bolt://localhost:7687** as **Connect URL**
- Choose a **user** and a **password**
- Insert the credentials in .env:
  **Username**: NEO4J_USER = insert the user set in the db
  **Password**: NEO4J_PW = insert the password set in the db
- In .env add:
API_KEY = your_personal_api_key
To set the API key to access the Create an edition functionalities.
- Run the application locally: **nodemon app.js**
- Open the application in your browser: **http://0.0.0.0:80/**

## Neo4j Graph
In the application it is possible to create and store data in the Neo4j database, where they are structured as a graph. To create data and check the resulting graph, it is necessary to:

- Click on **Create an edition** in the navbar of the application.
- Follow the required steps.
- Open the database accessed via **Remote connection** in Neo4j Desktop.
- Click on **Database Information** (first icon on the top of the sidebar on the left).
- Click on one of the **Node Labels** or **Relationship Types**.
- A graph automatically appears in the body of the page.

To browse the graph, it is possible to:

- Use the tools provided by Neo4j on the user-side.
- Run a [CYPHER](https://neo4j.com/developer/cypher/) query by inserting it in the bar above the graph and clicking on the rerun icon.
