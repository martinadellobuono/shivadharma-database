# Śivadharma Database Project

**Śivadharma Database** is a [Neo4j](https://neo4j.com/) web application built with [Node.js](https://nodejs.org/en/). 
The project is ongoing and under development.

## Quick start

Clone this repository using the URL https://github.com/martinadellobuono/shivadharma-neo4j.git
or download the folder.

The project works with:

- [**Node.js**](https://nodejs.org/en/) v16.14.2
- [**Express**](https://www.npmjs.com/package/express) > express@4.17.1
- [**body-parser**](https://www.npmjs.com/package/body-parser) > body-parser@1.19.0
- [**ejs**](https://www.npmjs.com/package/ejs) > ejs@3.1.6
- [**express-validator**](https://www.npmjs.com/package/express-validator) > express-validator@6.14.0
- [**formidable**](https://www.npmjs.com/package/formidable) > formidable@1.2.6 
- [**neo4j-driver**](https://www.npmjs.com/package/neo4j-driver) > neo4j-driver@4.4.4

Packages can be installed with [**NPM**](https://www.npmjs.com/).

After installing the required packages:

- Download **Neo4j Desktop**: https://neo4j.com/download/
- Create a new **Project**
- Click on the **Add** button
- Select **Remote connection**
- Insert the **Connection URL**: bolt://localhost:7687
- Insert the credentials:
  **Username**: neo4j
  **Password**: 123456
- Run the application locally: **nodemon app.js**
- Open the application in your browser: **http://0.0.0.0:3000/**

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
