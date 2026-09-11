import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { parcelApi } from '../../services/parcelApi.js';
import { Card, Skeleton, ErrorState } from '../common/UI.jsx';
import { getStatusColor, getStatusLabel, STATUS_COLORS } from '../../utils/format.js';
import ParcelDrawer from './ParcelDrawer.jsx';
import { Filter, Maximize2 } from 'lucide-react';

const PARCEL_STATUS_STYLES = {
  ACQUIRED: { color: '#059669', fillColor: '#d1fae5', fillOpacity: 0.7, weight: 1.5 },
  PENDING: { color: '#d97706', fillColor: '#fef3c7', fillOpacity: 0.7, weight: 1.5 },
  DISPUTED: { color: '#dc2626', fillColor: '#fee2e2', fillOpacity: 0.8, weight: 2 },
  POSSESSION_TAKEN: { color: '#0d9488', fillColor: '#ccfbf1', fillOpacity: 0.7, weight: 1.5 },
  NOTIFIED: { color: '#7c3aed', fillColor: '#ede9fe', fillOpacity: 0.7, weight: 1.5 },
  DEFAULT: { color: '#6b7280', fillColor: '#f3f4f6', fillOpacity: 0.5, weight: 1 },
};

const BOUNDARY_STYLE = {
  color: '#1d24d9', fillColor: '#1d24d9', fillOpacity: 0.05, weight: 2.5,
  dashArray: '8 4',
};

const STATUS_FILTERS = ['ALL', 'ACQUIRED', 'PENDING', 'DISPUTED', 'POSSESSION_TAKEN', 'NOTIFIED'];

function FitBounds({ geoData }) {
  const map = useMap();
  useEffect(() => {
    if (!geoData) return;
    try {
      const layer = L.geoJSON(geoData);
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    } catch {}
  }, [geoData, map]);
  return null;
}

export default function GISTab({ projectId }) {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchKhasra, setSearchKhasra] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await parcelApi.getGisProject(projectId);
      setGeoData(res.data.data);
    } catch (err) {
      setError(err?.message || 'Failed to load GIS data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleParcelSelect = (parcelId) => {
    setSelectedParcelId(parcelId);
    setDrawerOpen(true);
  };

  const styleFeature = (feature) => {
    if (feature.properties.type === 'boundary') return BOUNDARY_STYLE;
    const status = feature.properties.status;
    return PARCEL_STATUS_STYLES[status] || PARCEL_STATUS_STYLES.DEFAULT;
  };

  const filteredGeoData = geoData ? {
    ...geoData,
    features: geoData.features.filter(f => {
      if (f.properties.type === 'boundary') return true;
      if (statusFilter !== 'ALL' && f.properties.status !== statusFilter) return false;
      if (searchKhasra && !f.properties.khasraNo?.toLowerCase().includes(searchKhasra.toLowerCase())) return false;
      return true;
    }),
  } : null;

  const onEachFeature = (feature, layer) => {
    if (feature.properties.type === 'boundary') {
      layer.bindTooltip(feature.properties.name, { sticky: true, className: 'text-xs' });
      return;
    }
    const p = feature.properties;
    layer.bindPopup(`
      <div style="font-family:Inter,sans-serif;font-size:12px;min-width:160px">
        <div style="font-weight:600;margin-bottom:6px;font-size:13px;">${p.khasraNo}</div>
        <div style="color:#6b7280;margin-bottom:4px;">${p.village || ''}</div>
        <div style="margin-bottom:4px;"><span style="font-weight:500;">Area:</span> ${p.area} ha</div>
        <div style="margin-bottom:8px;"><span style="font-weight:500;">Status:</span> ${getStatusLabel(p.status)}</div>
        <button onclick="window.__nlas_parcel_select('${p.id}')" 
          style="background:#1d24d9;color:white;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:500;">
          View Details
        </button>
      </div>
    `);

    // Hover effects
    layer.on({
      mouseover: (e) => { e.target.setStyle({ weight: 3, fillOpacity: 0.9 }); },
      mouseout: (e) => { e.target.setStyle(styleFeature(feature)); },
      click: () => {
        layer.openPopup();
      },
    });
  };

  // Bridge between Leaflet popup button and React state
  useEffect(() => {
    window.__nlas_parcel_select = (id) => handleParcelSelect(id);
    return () => { delete window.__nlas_parcel_select; };
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  // Legend items
  const legendItems = [
    { status: 'ACQUIRED', label: 'Acquired', color: '#059669' },
    { status: 'PENDING', label: 'Pending', color: '#d97706' },
    { status: 'DISPUTED', label: 'Disputed', color: '#dc2626' },
    { status: 'POSSESSION_TAKEN', label: 'Possession', color: '#0d9488' },
    { status: 'NOTIFIED', label: 'Notified', color: '#7c3aed' },
  ];

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search Khasra No..."
          value={searchKhasra}
          onChange={e => setSearchKhasra(e.target.value)}
          className="form-input w-40 py-1.5 text-xs"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-navy-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'ALL' ? 'All' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <Skeleton className="h-[520px] w-full rounded-xl" />
        ) : (
          <div className="relative">
            <MapContainer
              center={[28.74, 77.55]}
              zoom={12}
              style={{ height: '520px', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredGeoData && (
                <>
                  <GeoJSON
                    key={JSON.stringify(filteredGeoData) + statusFilter + searchKhasra}
                    data={filteredGeoData}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                  />
                  <FitBounds geoData={filteredGeoData} />
                </>
              )}
            </MapContainer>

            {/* Legend overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 p-3 z-[1000]">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Legend</p>
              {legendItems.map(item => (
                <div key={item.status} className="flex items-center gap-2 mb-1 last:mb-0">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Parcel drawer */}
      <ParcelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        parcelId={selectedParcelId}
      />
    </div>
  );
}
