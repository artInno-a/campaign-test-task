import React, { useState } from 'react';
import { 
  Upload, 
  Plus, 
  Trash2, 
  Send, 
  Loader2, 
  LayoutTemplate, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/campaigns';

const App = () => {
  const [activeTab, setActiveTab] = useState('generate'); // 'upload' or 'generate'
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <LayoutTemplate size={32} />
          <div>
            <h1 className="text-2xl font-bold">Creative Automation Pipeline</h1>
            <p className="text-indigo-100 text-sm">GenAI Campaign Asset Generator</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'generate' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            <Send size={18} /> Generate Campaign
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'upload' 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            <Upload size={18} /> Upload Assets
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {activeTab === 'generate' ? <CampaignForm /> : <AssetUploader />}
        </div>
      </main>
    </div>
  );
};

// --- Sub-Component: Asset Uploader ---
const AssetUploader = () => {
  const [productName, setProductName] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !productName) {
      setStatus({ type: 'error', msg: 'Please provide both a product name and a file.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', productName);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: `Success! ${data.message}` });
        setProductName('');
        setFile(null);
      } else {
        setStatus({ type: 'error', msg: data.error || 'Upload failed' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Network error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ImageIcon className="text-indigo-600" /> Upload Existing Assets
      </h2>
      <p className="text-slate-500 mb-6">
        Upload existing product photography to save on GenAI costs. 
        Files must be PNGs. The system will automatically reuse these based on the Product Name.
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name (Exact Match)</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Citrus_Spark_Soda"
          />
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
          <input
            type="file"
            id="fileInput"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            accept="image/png"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
            <Upload size={40} className="text-slate-400 mb-2" />
            <span className="text-indigo-600 font-medium">Click to browse</span>
            <span className="text-slate-500 text-sm mt-1">
              {file ? file.name : 'Select PNG file'}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
          Upload Asset
        </button>
      </form>

      {status.msg && (
        <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p>{status.msg}</p>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Campaign Form ---
const CampaignForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    campaignName: '',
    targetRegion: '',
    targetAudience: '',
    campaignMessage: '',
    products: [
      { name: '', description: '', visualStyle: '' }
    ]
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', description: '', visualStyle: '' }]
    });
  };

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      const newProducts = formData.products.filter((_, i) => i !== index);
      setFormData({ ...formData, products: newProducts });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ type: 'success', data });
      } else {
        setResult({ type: 'error', data });
      }
    } catch (error) {
      setResult({ type: 'error', data: { error: 'Failed to connect to server.' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Campaign Details */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-800">Campaign Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
              <input required name="campaignName" value={formData.campaignName} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Summer Launch" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Region</label>
              <input required name="targetRegion" value={formData.targetRegion} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Europe, Japan, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
              <input required name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Gen Z, Parents, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Message</label>
              <input required name="campaignMessage" value={formData.campaignMessage} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="The main slogan overlay" />
            </div>
          </div>
        </div>

        {/* Section 2: Products */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Products</h2>
            <button type="button" onClick={addProduct} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1">
              <Plus size={16} /> Add Product
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.products.map((product, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative">
                {formData.products.length > 1 && (
                  <button type="button" onClick={() => removeProduct(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                    <input required value={product.name} onChange={(e) => handleProductChange(index, 'name', e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="Exact product name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <input required value={product.description} onChange={(e) => handleProductChange(index, 'description', e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="Product details" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Visual Style</label>
                    <input required value={product.visualStyle} onChange={(e) => handleProductChange(index, 'visualStyle', e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="e.g. Minimalist, Neon" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 text-lg shadow-md transition-all hover:shadow-lg disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          {loading ? 'Generating Assets...' : 'Generate Campaign'}
        </button>
      </form>

      {/* Results Display */}
      {result && (
        <div className={`mt-8 p-6 rounded-xl border ${result.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${result.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {result.type === 'success' ? <CheckCircle /> : <AlertCircle />}
            {result.type === 'success' ? 'Campaign Generated Successfully' : 'Generation Failed'}
          </h3>
          
          {result.type === 'success' ? (
            <div className="text-green-700">
              <p>{result.data.message}</p>
              <p className="text-sm mt-2 opacity-80">Processed {result.data.products_processed} product(s). Check your local <code>/assets/output</code> folder for the files.</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p className="font-medium">Error: {result.data.error}</p>
              <p className="text-sm mt-1">Please check the campaign brief and try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
