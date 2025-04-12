from flask import Flask, render_template, send_from_directory, request, jsonify
import os
import subprocess
import json

#app = Flask(__name__)
app = Flask(__name__, static_folder='static')


# Define paths
DATA_FOLDER = "data"
BACKEND_FOLDER = "backend"
JS_FOLDER = "js"
CSS_FOLDER = "css"

# Route: Serve the main HTML page
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Route: Run backend scripts
@app.route('/run_scripts', methods=['POST'])
def run_scripts():
    print("run_scripts() called")  # 添加日志
    try:
        # List of backend scripts to execute
        scripts = [
            "1parcel_spatial_distance.py",
            "3TimeCompletionGraph_interval.py"
        ]
        for script in scripts:
            script_path = os.path.join(BACKEND_FOLDER, script)
            result = subprocess.run(
                ['python', script_path],
                capture_output=True,  # 捕获输出
                text=True,  # 输出为文本
                check=True  # 如果返回非零退出状态会抛出异常
            )
            print(f"Script {script} executed successfully.")
            print("stdout:", result.stdout)  # 打印标准输出
            print("stderr:", result.stderr)  # 打印错误输出
        return {"status": "success", "message": "Scripts executed successfully."}
    except subprocess.CalledProcessError as e:
        # 返回更详细的错误信息
        return {
            "status": "error",
            "message": f"Error executing script. Exit code: {e.returncode}, Output: {e.output}, Error: {e.stderr}"
        }, 500

# Route: Serve static files (CSS, JS)
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(CSS_FOLDER, filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(JS_FOLDER, filename)

@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory(DATA_FOLDER, filename)


# New route: Update the source path from frontend
@app.route('/update-source', methods=['POST'])
def update_source():
    try:
        data = request.get_json()
        selected_source = data.get('selectedSource')

        # Save the selected source path in a configuration file (config.json)
        with open('config.json', 'w') as config_file:
            json.dump({"selectedSource": selected_source}, config_file)

        return jsonify({"status": "success", "message": "Source updated successfully."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/reset-source', methods=['POST'])
def reset_source():
    try:
        default_config = {"selectedSource": "Source1"}
        with open('config.json', 'w') as config_file:
            json.dump(default_config, config_file)
        return jsonify({"status": "success", "message": "Source reset to default (Source1)."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
