<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDocumentRessource } from '@/api/document-ressource';
import type { PdfDocument, IngestionResponse } from '@/api/ChatbotService.schemas';

const { postApiDocumentUpload, getApiDocument, getApiDocumentDocName, deleteApiDocumentDocName } = getDocumentRessource();

interface DocumentType extends PdfDocument {
  contentPreview: string;
  newName?: string;
}

const file = ref<File | null>(null);
const docName = ref<string>(''); // input for document name; fallback to file.name if not provided
const uploadMessage = ref<string>('');
const documents = ref<DocumentType[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
  }
};

const handleDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    file.value = e.dataTransfer.files[0];
    e.dataTransfer.clearData();
  }
};

const uploadDocument = async () => {
  if (!file.value) return;
  const reader = new FileReader();

  // Use data URL for PDFs; for others, read as text.
  if (file.value.type === 'application/pdf') {
    reader.readAsDataURL(file.value);
  } else {
    reader.readAsText(file.value);
  }

  reader.onload = async () => {
    const content = reader.result as string;
    // Use provided name or fallback to the file name.
    const nameToUse = docName.value.trim() !== '' ? docName.value.trim() : file.value!.name;
    // Create the document payload.
    const documentPayload: PdfDocument = {
      docName: nameToUse,
      pageContent: content
    };

    try {
      const response = await postApiDocumentUpload<IngestionResponse>(documentPayload);
      // Adjust these lines if your response is nested under `data`
      const response_filename = response.data ? response.data.message : response.message;
      const response_duration = response.data ? response.data.executionTime : response.executionTime;
      documents.value.unshift({
        docName: nameToUse,
        pageContent: content,
        contentPreview: content.substring(0, 50) + '...',
        newName: nameToUse
      });
      file.value = null;
      docName.value = '';
      uploadMessage.value = `Document uploaded successfully: ${response_filename} (${response_duration}ms)`;
    } catch (error: any) {
      uploadMessage.value = 'Upload failed: ' + (error.response?.data || error.message);
    }
  };
};

const fetchAllDocuments = async () => {
  try {
    const response = await getApiDocument();
    // Assuming the API response returns an array of document names.
    documents.value = Array.isArray(response.data)
      ? response.data.map((docName: string) => ({
          docName,
          pageContent: '',
          contentPreview: '',
          newName: docName
        }))
      : [];
  } catch (error: any) {
    console.error('Error fetching documents:', error.message);
    documents.value = [];
  }
};

const fetchDocumentContent = async (doc: DocumentType) => {
  try {
    const response = await getApiDocumentDocName(doc.docName!);
    doc.pageContent = response.data;
    doc.contentPreview = response.data.substring(0, 50) + '...';
  } catch (error: any) {
    console.error('Error fetching document content:', error.message);
  }
};

const deleteDocument = async (doc: DocumentType) => {
  try {
    await deleteApiDocumentDocName(doc.docName!);
    documents.value = documents.value.filter(d => d.docName !== doc.docName);
  } catch (error: any) {
    uploadMessage.value = 'Delete document failed: ' + (error.response?.data || error.message);
  }
};

onMounted(fetchAllDocuments);
</script>

<template>
  <div class="document-uploader">
    <!-- Document Name Input -->
    <div class="upload-controls">
      <input v-model="docName" placeholder="Enter document name (optional)" />
    </div>
    <!-- File Drag & Drop Section -->
    <div class="drop-zone" @dragover.prevent @drop.prevent="handleDrop" @click="triggerFileSelect">
      <p v-if="!file">Drag & drop a file here or click to select one.</p>
      <p v-else>{{ file.name }}</p>
      <input type="file" ref="fileInput" style="display: none" @change="handleFileSelect" />
    </div>
    <button :disabled="!file" @click="uploadDocument">Upload Document</button>
    <p v-if="uploadMessage">{{ uploadMessage }}</p>

    <!-- List Documents -->
    <button @click="fetchAllDocuments">List All Documents</button>
    <ul v-if="documents.length > 0">
      <li v-for="doc in documents" :key="doc.docName">
        <strong>📑 Document Name: {{ doc.docName }}</strong>
        <p><strong>Content preview:</strong> {{ doc.contentPreview }}</p>
        <button @click="fetchDocumentContent(doc)">Load Content</button>
        <button @click="deleteDocument(doc)">Delete Document</button>
      </li>
    </ul>
    <p v-else>No documents available.</p>
  </div>
</template>

<style scoped>
.document-uploader {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}
.upload-controls {
  margin-bottom: 8px;
}
.drop-zone {
  border: 2px dashed #aaa;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
  cursor: pointer;
}
</style>