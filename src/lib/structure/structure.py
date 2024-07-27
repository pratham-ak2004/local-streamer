import os , json , argparse

folder_structure = {}

def get_folder_structure(curr_path : str) -> dict:
    return {
        "name" : os.path.basename(curr_path),
        "path" : curr_path,
        "folders" : [get_folder_structure(os.path.join(curr_path, folder)) for folder in os.listdir(curr_path) if os.path.isdir(os.path.join(curr_path, folder))],
        "files" : [item for item in os.listdir(curr_path) if os.path.isfile(os.path.join(curr_path, item))]
    }
    
    
def generate_JSON_folder_structure(curr_path : str) -> dict:
    folder_structure = get_folder_structure(curr_path)
        
    return folder_structure


def generate_JSON_file(output_dir : str , structure : dict) -> None:

    if output_dir.endswith(".json"):
        output_dir = os.path.dirname(output_dir)
    elif output_dir.endswith('/'):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        output_dir = output_dir + "structure.json"
    else:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        output_dir = output_dir + "/structure.json"
    
    with open(os.path.join(output_dir) , "w") as f:
        f.write(json.dumps(structure, indent=2))
        

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a JSON file of the folder structure from a directory.")
    parser.add_argument("-d" , "--dir", type=str, default="." ,help="The directory to scan")
    parser.add_argument("-o" , "--output", type=str, default=".", help="The output directory")
    
    args = parser.parse_args()
    working_dir = args.dir
    output_dir = args.output
    
    if working_dir:
        print("Generating JSON file of folder structure...")
        print("Working directory: ", working_dir)
        try:
            folder_structure = generate_JSON_folder_structure(working_dir)
            generate_JSON_file(output_dir , folder_structure)
        except:
            print("Failed to generate JSON file.")
        else:
            print("JSON file generated successfully at" , os.path.join(output_dir))