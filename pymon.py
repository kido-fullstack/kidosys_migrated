import json
from pymongo import MongoClient
from bson.json_util import dumps

# Replace with your actual MongoDB URI
MONGO_URI = 'mongodb://localhost:27017/staging?retryWrites=true&w=majority'
# MONGO_URI = 'mongodb+srv://kido_admin:q8HeYTvfYwOyv4lz@kido.flmyjkt.mongodb.net/staging?retryWrites=true&w=majority'

DATABASE_NAME = "staging"
COLLECTION_NAME = "leads"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

sleFlds = {
    "country_id": 1,
    "zone_id": 1,
    "school_id": 1,
    "type": 1,
    "lead_no": 1,
    "parent_email": 1,
    "lead_date": 1,
    "updatedAt": 1,
    "follow_due_date": 1,
    "parent_name": 1,
    "child_first_name": 1,
    "child_last_name": 1,
    "source_category": 1,
    "parent_know_aboutus": 1,
    "program_id": 1,
    "stage": 1,
    "status_id": 1,
    "substatus_id": 1,
    "action_taken": 1,
    "remark": 1,
    "initial_notes": 1,
    "updatedBy_name": 1
}

# Fetch all documents from the collection
# documents = collection.find({},sleFlds)
documents = collection.find({},sleFlds)
# documents = collection.find({},sleFlds)

# Convert documents to a list of dictionaries
documents_list = list(documents)

json_data = dumps(documents_list, indent = 2)

print((json_data))
# print( json.dumps( str( documents_list)))


# with open('output.txt', 'w') as file:
#     file.write(str(documents_list))

