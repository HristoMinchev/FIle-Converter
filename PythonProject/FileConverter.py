import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads/'
CONVERTED_FOLDER = 'converted/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

@app.route('/convert', methods=['POST'])
def convert_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    document_type = request.form['type']
    print(document_type)

    try:
        filename = secure_filename(file.filename)
        converted_filename = f"converted_{filename}.{document_type}"

        file_path = os.path.join(CONVERTED_FOLDER, converted_filename)
        file.save(file_path)

        return jsonify({
            'message': 'File converted successfully',
            'original_filename': filename,
            'converted_filename': converted_filename
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        file_path = os.path.join(CONVERTED_FOLDER, filename)

        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
