import { useState, useMemo, useRef, useEffect } from 'react';
import { Heart, MapPin, Users, Share2, Trash2, Star, Search, Download, ExternalLink, CheckCircle } from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { VideoPlayer } from './VideoPlayer';
import { StatusBadge } from './StatusBadge';
import { parseConfigDate } from '../../lib/contestConfig';

export const GalleryView = ({ videos, onVote, onBack, isAdmin, onUpdateVotes, onDelete, onModerate, loading, onShare, user, onNavigate, highlightId, contestConfig, votedIds = new Set() }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tots');

  // Determinar si el vot es "Premium" o "Bàsic"
  const isPremiumVoter = user && !user.isAnonymous;
  const voteValue = isPremiumVoter ? 5 : 1;

  const votingEndsAt = parseConfigDate(contestConfig?.votingEndsAt);
  const votingClosed = votingEndsAt ? new Date() >= votingEndsAt : false;

  const pendingCount = useMemo(() => videos.filter(v => v.status === 'pendent').length, [videos]);

  const filteredVideos = useMemo(() => {
    // El públic només veu vídeos aprovats (o sense status, per compatibilitat
    // amb vídeos anteriors a la moderació). L'admin veu i modera tots.
    const visible = isAdmin ? videos : videos.filter(v => v.status === 'aprovat' || v.status == null);
    return visible.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Tots' || video.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (isAdmin) {
        const rank = (v) => v.status === 'pendent' ? 0 : v.status === 'rebutjat' ? 2 : 1;
        const diff = rank(a) - rank(b);
        if (diff !== 0) return diff;
      }
      return b.votes - a.votes;
    });
  }, [videos, searchTerm, filterCategory, isAdmin]);

  // Deep-link: quan s'arriba amb #v=<id>, desplaça (un sol cop) i ressalta aquell vídeo.
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (!highlightId || scrolledRef.current) return;
    const el = document.getElementById(`video-${highlightId}`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); scrolledRef.current = true; }
  }, [highlightId, filteredVideos]);

  const exportToCSV = () => {
    const headers = "ID,Titol,Autor,Categoria,Lloc,Vots,Enllaç,Data\n";
    const rows = videos.map(v =>
      `${v.id},"${v.title}","${v.author}","${v.category}","${v.location}",${v.votes},"${v.url}",${new Date(v.createdAt).toLocaleDateString()}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "molins_dansa_participants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600">← Inici</button>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" onClick={exportToCSV} className="text-xs px-3 py-1">
                <Download size={14} /> Exportar Dades
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Galeria
              {isAdmin && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold uppercase">Admin</span>}
              {isAdmin && pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">{pendingCount} pendents</span>
              )}
            </h2>
            <p className="text-gray-500">Explora {filteredVideos.length} actuacions</p>
          </div>
        </div>

        {/* CALL TO ACTION FOR VOTING */}
        {!isPremiumVoter && !votingClosed && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full text-amber-600"><Star size={20} fill="currentColor" /></div>
              <div>
                <h4 className="font-bold text-amber-900">Vols que el teu vot valgui x5?</h4>
                <p className="text-sm text-amber-700">Els usuaris registrats tenen més poder de vot.</p>
              </div>
            </div>
            <Button variant="gold" onClick={() => onNavigate('auth')} className="text-sm">Registrar-me ara</Button>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Cercar..." className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="Tots">Totes les Categories</option><option value="Individual">Individual</option><option value="Grup">Grup</option><option value="Escola de Dansa">Escoles</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregant vídeos...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No s'han trobat vídeos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, idx) => (
            <Card key={video.id} id={`video-${video.id}`} className={`group hover:shadow-2xl transition-all duration-300 border ${video.id === highlightId ? 'ring-2 ring-rose-500 ring-offset-2' : isAdmin ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
              <VideoPlayer url={video.url} thumbnail={video.thumbnail} title={video.title} />
              <div className="relative">
                <div className="absolute -top-10 right-3 z-20"><Badge color="bg-black/50 text-white backdrop-blur-md">{video.category}</Badge></div>
                {idx < 3 && <div className="absolute -top-10 left-3 bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white z-20">#{idx + 1}</div>}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{video.title}</h3>
                <p className="text-gray-600 text-sm flex items-center gap-1 mb-2"><Users size={14} /> {video.author}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location + ", Molins de Rei")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-rose-600 hover:underline mb-4 font-medium"
                >
                  <MapPin size={12} /> {video.location} <ExternalLink size={10} />
                </a>

                {isAdmin ? (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 space-y-2">
                    <div className="flex items-center justify-between"><label className="text-xs font-bold text-red-800 uppercase">Admin</label><button onClick={() => onDelete(video.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></div>
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={video.status} />
                      <div className="flex gap-1">
                        <button onClick={() => onModerate(video.id, 'aprovat')} disabled={video.status === 'aprovat'} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold">Aprovar</button>
                        <button onClick={() => onModerate(video.id, 'rebutjat')} disabled={video.status === 'rebutjat'} className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold">Rebutjar</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdateVotes(video.id, video.votes - 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-red-200 rounded">-</button>
                      <input type="number" value={video.votes} onChange={(e) => onUpdateVotes(video.id, parseInt(e.target.value) || 0)} className="w-full text-center font-bold text-lg bg-white border border-red-200 rounded py-1" />
                      <button onClick={() => onUpdateVotes(video.id, video.votes + 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-red-200 rounded">+</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 gap-2">
                    <div className="text-gray-500 text-sm"><span className="font-bold text-gray-900 text-lg">{video.votes}</span> vots</div>
                    <div className="flex gap-2">
                      <button onClick={() => onShare(video)} className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors" title="Compartir"><Share2 size={18} /></button>
                      {votingClosed ? (
                        <span className="text-xs text-gray-400 font-medium px-3 py-2 whitespace-nowrap">Votació tancada</span>
                      ) : votedIds.has(video.id) ? (
                        <span className="flex items-center gap-2 text-xs text-green-600 font-semibold px-3 py-2 whitespace-nowrap">
                          <CheckCircle size={16} /> Vot registrat
                        </span>
                      ) : (
                        <button onClick={() => onVote(video.id)} className={`flex items-center gap-2 px-4 py-2 ${isPremiumVoter ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600'} rounded-full transition-colors font-semibold group-active:scale-95`}>
                          <Heart size={18} className={isPremiumVoter ? "fill-amber-600 text-amber-600" : "group-hover:fill-rose-600"} />
                          Votar (+{voteValue})
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
