
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

/**
 * Generates a document from a .docx template.
 * 
 * @param {string|ArrayBuffer} templateData - The URL of the template or the ArrayBuffer of the file.
 * @param {Object} data - The data to fill into the template.
 * @param {string} outputName - The name of the file to download.
 */
export const generateDocument = async (templateInput, data, outputName = 'document.docx') => {
    try {
        let content = null;

        // Check if input is a URL (string) or ArrayBuffer
        if (typeof templateInput === 'string') {
            // Fetch the template if it's a URL
            const response = await fetch(templateInput);
            if (!response.ok) {
                throw new Error(`Failed to fetch template: ${response.statusText}`);
            }
            content = await response.arrayBuffer();
        } else {
            content = templateInput;
        }

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Render the document
        doc.render(data);

        // Get the zip document and generate it as a blob
        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // Output the document using Data-URI
        saveAs(out, outputName);
        return true;

    } catch (error) {
        console.error("Error generating document:", error);

        if (error.properties && error.properties.errors) {
            const errorMessages = error.properties.errors.map(function (error) {
                return error.properties.explanation;
            }).join("\n");
            console.error("Docxtemplater errors:", errorMessages);
            throw new Error(`Template Error: ${errorMessages}`);
        }

        throw error;
    }
};
