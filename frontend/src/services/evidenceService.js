import api from './api';

export const evidenceService = {
  async upload(formData) {
    const response = await api.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.caseNumber) params.append('caseNumber', filters.caseNumber);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/evidence?${params.toString()}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/evidence/${id}`);
    return response.data;
  },

  async verify(id) {
    const response = await api.post(`/evidence/${id}/verify`);
    return response.data;
  },

  async transfer(id, targetUsername, transferNote) {
    const response = await api.post(`/evidence/${id}/transfer`, {
      targetUsername,
      transferNote,
    });
    return response.data;
  },

  async simulateTamper(id) {
    const response = await api.post(`/evidence/${id}/tamper-simulate`);
    return response.data;
  },

  getDownloadUrl(id) {
    const token = localStorage.getItem('jwt_token');
    return token ? `/api/evidence/${id}/download?token=${encodeURIComponent(token)}` : `/api/evidence/${id}/download`;
  },

  getCertificateUrl(id) {
    const token = localStorage.getItem('jwt_token');
    return token ? `/api/evidence/${id}/certificate?token=${encodeURIComponent(token)}` : `/api/evidence/${id}/certificate`;
  },

  async downloadCertificate(id, fileName = `Evidence_Certificate_${id}.pdf`) {
    const response = await api.get(`/evidence/${id}/certificate`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  },

  async openCertificateInNewTab(id) {
    const response = await api.get(`/evidence/${id}/certificate`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  },

  async downloadEvidenceFile(id, fileName) {
    const response = await api.get(`/evidence/${id}/download`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `evidence_${id}.bin`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  },

  async getCustodyLogs(evidenceId) {
    const response = await api.get(`/custody/evidence/${evidenceId}`);
    return response.data;
  },

  async getRecentCustody() {
    const response = await api.get('/custody/recent');
    return response.data;
  },

  async getRedacted(id) {
    const response = await api.get(`/evidence/${id}/redacted`);
    return response.data;
  },

  async getSummary(id) {
    const response = await api.get(`/evidence/${id}/summary`);
    return response.data;
  }
};
