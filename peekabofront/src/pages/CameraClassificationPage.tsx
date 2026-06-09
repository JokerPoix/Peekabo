import React, { useState } from 'react';

const CameraClassificationPage: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [topK, setTopK] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topPrediction, setTopPrediction] = useState<{ species: string; confidence: number } | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loadingDescription, setLoadingDescription] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const fetchBirdDescription = async (speciesName: string) => {
    setDescription(null);
    setLoadingDescription(true);
    try {
      const response = await fetch('/llm/get-chat-birds/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Crée un courte description (2-3 phrases) àpropos de cette espèce d'oiseau : ${speciesName}, avec l'habitat et les caractéristiques physiques. Répond uniquement avec la description, sans autre texte ou formatage.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const data = part.slice(6);
            if (data === '[DONE]') break;
            fullText += data;
          }
        }

        // Capture snapshot so React 18 batching sees per-chunk values
        const snapshot = fullText;
        setDescription(snapshot);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setDescription(`Unable to load description: ${message}`);
    } finally {
      setLoadingDescription(false);
    }
  };

  const sendToApi = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setTopPrediction(null);
    setDescription(null);
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
      setResult(data);
      const prediction = data.top_prediction || null;
      setTopPrediction(prediction);

      if (prediction) {
        fetchBirdDescription(prediction.species);
      }
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
      {topPrediction && (
        <div className="prediction-result">
          <h3>Espèce prédite :</h3>
          <p className="species-name">{topPrediction.species}</p>
          <p className="confidence">Confiance : {(topPrediction.confidence * 100).toFixed(2)}%</p>
          {loadingDescription && <div className="description-loading">Chargement de la description...</div>}
          {description && (
            <div className="description">
              <h4>Description :</h4>
              <p>{description}</p>
            </div>
          )}
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default CameraClassificationPage;
