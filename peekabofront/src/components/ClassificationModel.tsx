import React, { useState } from 'react';

const ClassificationModel: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [topK, setTopK] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const sendToApi = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const base64 = imageBase64.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = Array.from(byteCharacters, (c) => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('top_k', String(topK));

      const response = await fetch('/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unknown error');
      }
      setResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onFileChange} />
      <input
        type="number"
        min={1}
        max={10}
        placeholder="Top K (default 3)"
        value={topK}
        onChange={(e) => setTopK(parseInt(e.target.value, 10))}
      />
      <button onClick={sendToApi} disabled={!imageBase64 || loading}>
        Envoyer
      </button>
      {loading && <div>Analyse en cours...</div>}
      {result && <pre>{result}</pre>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default ClassificationModel;
