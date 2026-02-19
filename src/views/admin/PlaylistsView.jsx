import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Calendar, Edit, Trash2, Clock, X, CloudUpload, Loader2, CheckCircle, ListVideo } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PlaylistEditor from '../../components/admin/PlaylistEditor';
import GlassCard from '../../components/ui/GlassCard';

export default function PlaylistsView() {
    // --- State ---
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [editingPlaylist, setEditingPlaylist] = useState(null);

    // --- Effects ---
    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('playlists')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPlaylists(data || []);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('playlists')
                .insert([{ name: newPlaylistName, owner_id: user?.id || null, items: [] }])
                .select();

            if (error) throw error;
            setPlaylists([data[0], ...playlists]);
            setNewPlaylistName('');
            setIsCreating(false);
            setEditingPlaylist(data[0]); // Open editor immediately
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    };

    const deletePlaylist = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir esta playlist?')) return;
        try {
            const { error } = await supabase.from('playlists').delete().eq('id', id);
            if (error) throw error;
            setPlaylists(playlists.filter(p => p.id !== id));
        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <AnimatePresence>
                {editingPlaylist && (
                    <PlaylistEditor
                        playlist={editingPlaylist}
                        onClose={() => setEditingPlaylist(null)}
                        onSave={() => {
                            setEditingPlaylist(null);
                            fetchPlaylists();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ListVideo className="text-lumen-accent" />
                        Gerenciar Playlists
                    </h2>
                    <p className="text-white/40 text-sm">Crie e organize o conteúdo das suas telas.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary-glow flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nova Playlist</span>
                </button>
            </div>

            {/* Quick Creator Inline */}
            <AnimatePresence>
                {isCreating && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={createPlaylist}
                        className="glass-card p-6 mb-6 relative overflow-hidden"
                    >
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-white/30 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-lumen-accent/20 text-lumen-accent">
                                <Plus className="w-6 h-6" />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nome da Playlist (ex: Campanhas de Verão)"
                                className="flex-1 bg-transparent text-white text-xl placeholder-white/20 outline-none font-display font-medium"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                            />
                            <button type="submit" className="px-6 py-2 rounded-xl bg-lumen-accent text-white font-medium hover:bg-lumen-accent/80 transition-colors">
                                Criar Agora
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Playlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                    </div>
                ) : playlists.length === 0 && !isCreating ? (
                    <div className="col-span-full text-center py-20 text-white/30">
                        <ListVideo className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma playlist encontrada.</p>
                    </div>
                ) : (
                    playlists.map((playlist, index) => (
                        <GlassCard
                            key={playlist.id}
                            className="p-6 cursor-pointer group hover:border-lumen-accent/50 transition-all"
                            onClick={() => setEditingPlaylist(playlist)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-lumen-accent/10 transition-colors">
                                    <ListVideo className="w-6 h-6 text-white/60 group-hover:text-lumen-accent transition-colors" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => deletePlaylist(playlist.id, e)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lumen-accent transition-colors">
                                {playlist.name}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-white/40">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(playlist.created_at).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <span>{(playlist.items || []).length} itens</span>
                                <span>•</span>
                                <span>
                                    {Math.ceil((playlist.items || []).reduce((acc, i) => acc + (parseInt(i.duration) || 0), 0) / 60)} min
                                </span>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
