from py2neo import Graph
import pandas as pd

# Configurazione del database Neo4j
uri = "bolt://localhost:7687"  # Aggiorna l'URI se necessario
username = "neo4j"  # Username Neo4j
password = "password"  # Password Neo4j
graph = Graph(uri, auth=(username, password))

# Caricamento dei dati dal file Excel
file_path = 'metadata-mss-śivadharmottara-florinda.xlsx'
df = pd.read_excel(file_path, sheet_name='Sheet1')

# Funzione per creare la query e inserire i dati in Neo4j
def create_witness(graph, siglum, settlement, title, textLang, scripts):
    query = """
    MERGE (witness:Witness {
        siglum: $siglum,
        urlFacsimile: "",
        provenance: "",
        location: "",
        repository: $settlement,
        classmark: "",
        antigraph: "",
        author: "",
        title: $title,
        language: $textLang,
        scripts: $scripts,
        structuralTypology: "",
        state: "",
        condition: "",
        format: "",
        material: "",
        dimensionsW: "",
        dimensionsH: "",
        extent: "",
        binding: "",
        foliation: "",
        date: "",
        people: "",
        marginalia: "",
        initialRubric: "",
        incipit: "",
        explicit: "",
        finalRubric: "",
        colophon: "",
        bibliography: "",
        editions: "",
        secondaryLiterature: "",
        authorRecord: "",
        siglumTex: "",
        notes: ""
    })
    MERGE (edition)<-[:USED_IN]-(witness)
    RETURN witness
    """
    graph.run(query, siglum=siglum, settlement=settlement, title=title, textLang=textLang, scripts=scripts)

# Iterare su ogni riga del DataFrame e inserire i dati in Neo4j
for index, row in df.iterrows():
    siglum = row['<siglum>']
    settlement = row['<settlement>']
    title = row['<title> !! some have many titles as they are Multiple-Text-Manuscripts!!']
    textLang = row['<textLang>']
    scripts = row['OPTIONAL: SCRIPT']
    
    if pd.notna(siglum) and pd.notna(settlement) and pd.notna(title) and pd.notna(textLang) and pd.notna(scripts):
        create_witness(graph, siglum, settlement, title, textLang, scripts)

print("Dati caricati con successo!")