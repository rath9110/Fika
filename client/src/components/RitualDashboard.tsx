import React, { useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { TIERS } from '../mockData';
import type { Contact } from '../types';
import { logFikaInteraction, updateContact } from '../utils/api';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableContactProps {
    contact: Contact;
    warmth: string;
    onLogFika: (id: string) => void;
    statusText: string;
    warmthColor: string;
}

const SortableContact: React.FC<SortableContactProps> = ({
    contact,
    warmth,
    onLogFika,
    statusText,
    warmthColor
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: contact.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`card-fika group/card relative overflow-hidden cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-2xl scale-105' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-fika-900 text-lg">{contact.name}</h4>
                <div className="flex flex-col items-end">
                    <div className={`w-3 h-3 rounded-full ${warmth === 'warm' ? warmthColor + ' shadow-lg shadow-orange-200 animate-pulse' : warmthColor}`}></div>
                    <span className="text-[10px] uppercase font-bold text-fika-400 mt-1">{statusText}</span>
                </div>
            </div>

            {contact.hooks?.lastLaugh && (
                <div className="bg-cream/50 rounded-lg p-3 mt-3 border border-fika-50">
                    <p className="text-xs text-fika-600 italic leading-relaxed">
                        Last laugh: {contact.hooks.lastLaugh}
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-fika-50 opacity-0 group-hover/card:opacity-100 transition-all translate-y-2 group-hover/card:translate-y-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onLogFika(contact.id);
                    }}
                    className="text-xs font-bold text-fika-600 bg-white hover:bg-fika-50 px-4 py-2 rounded-full border border-fika-100 transition-colors shadow-sm cursor-pointer pointer-events-auto"
                >
                    Log Fika
                </button>
                <button className="p-2 rounded-full hover:bg-fika-50 transition-colors cursor-pointer pointer-events-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-fika-400" viewBox="0 0 16 16">
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

interface RitualDashboardProps {
    contacts: Contact[];
    setContacts: Dispatch<SetStateAction<Contact[]>>;
}

const RitualDashboard: React.FC<RitualDashboardProps> = ({ contacts, setContacts }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getWarmth = (contact: Contact) => {
        if (!contact.lastFika) return 'cold';
        const tier = TIERS.find(t => t.id === contact.tier);
        if (!tier) return 'neutral';

        const lastDate = new Date(contact.lastFika).getTime();
        const now = Date.now();
        const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);

        if (diffDays <= tier.cadenceInDays) return 'warm';
        if (diffDays <= tier.cadenceInDays * 2) return 'lukewarm';
        return 'cold';
    };

    const getWarmthColor = (warmth: string) => {
        switch (warmth) {
            case 'warm': return 'bg-orange-400';
            case 'lukewarm': return 'bg-amber-100 border border-amber-300';
            case 'cold': return 'bg-cyan-50 border border-cyan-200';
            default: return 'bg-gray-100';
        }
    };

    const getStatusText = (warmth: string) => {
        if (warmth === 'warm') return 'Glowing';
        if (warmth === 'lukewarm') return 'Cooling';
        return 'Dormant';
    };

    const onLogFika = async (id: string) => {
        try {
            await logFikaInteraction(id);
            setContacts(prev => prev.map(c =>
                c.id === id ? { ...c, lastFika: new Date().toISOString() } : c
            ));
        } catch (e) {
            // Optimistic update fallback
            setContacts(prev => prev.map(c =>
                c.id === id ? { ...c, lastFika: new Date().toISOString() } : c
            ));
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const overId = over.id.toString();

            if (TIERS.some(t => t.id === overId)) {
                const newTier = overId as any;
                setContacts(prev => prev.map(c =>
                    c.id === active.id ? { ...c, tier: newTier } : c
                ));
                try { await updateContact(active.id as string, { tier: newTier }); } catch (e) { }
                return;
            }

            const overContact = contacts.find(c => c.id === overId);
            if (overContact) {
                setContacts((items) => {
                    const oldIndex = items.findIndex(c => c.id === active.id);
                    const newIndex = items.findIndex(c => c.id === overId);
                    const updated = [...items];
                    updated[oldIndex] = { ...updated[oldIndex], tier: overContact.tier };
                    return arrayMove(updated, oldIndex, newIndex);
                });
                try { await updateContact(active.id as string, { tier: overContact.tier }); } catch (e) { }
            }
        }
    };

    const nudges = useMemo(() => {
        return contacts
            .filter(c => getWarmth(c) === 'cold')
            .slice(0, 2)
            .map(c => ({
                id: c.id,
                name: c.name,
                initial: c.name[0],
                tier: TIERS.find(t => t.id === c.tier),
                suggestion: c.hooks?.health
                    ? `Ask how the ${c.hooks.health.toLowerCase()} is going.`
                    : c.hooks?.lastLaugh
                        ? `Mention that thing you last laughed about: "${c.hooks.lastLaugh}".`
                        : "Just checking in! Saw this and thought of you."
            }));
    }, [contacts]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-16 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {TIERS.map((tier) => {
                        const tierContacts = contacts.filter(c => c.tier === tier.id);
                        return (
                            <div key={tier.id} className="group flex flex-col space-y-6 min-h-[500px]">
                                <div id={tier.id} className="flex flex-col space-y-2 border-l-2 border-fika-100 pl-4 group-hover:border-fika-300 transition-colors">
                                    <h3 className="font-bold text-fika-900 text-lg uppercase tracking-tight">{tier.name}</h3>
                                    <p className="text-xs text-fika-500 font-medium">{tier.description}</p>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <SortableContext
                                        items={tierContacts.map(c => c.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {tierContacts.length > 0 ? (
                                            tierContacts.map(contact => (
                                                <SortableContact
                                                    key={contact.id}
                                                    contact={contact}
                                                    warmth={getWarmth(contact)}
                                                    onLogFika={onLogFika}
                                                    statusText={getStatusText(getWarmth(contact))}
                                                    warmthColor={getWarmthColor(getWarmth(contact))}
                                                />
                                            ))
                                        ) : (
                                            <div id={tier.id} className="flex items-center justify-center min-h-[120px] bg-white/30 border-2 border-dashed border-fika-100 rounded-3xl">
                                                <span className="text-xs font-bold text-fika-300 uppercase tracking-widest text-center px-4">Drag here to promote</span>
                                            </div>
                                        )}
                                    </SortableContext>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dynamic Nudge Engine Footer */}
                <div className="bg-white rounded-[2rem] p-10 shadow-ritual border border-fika-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="100" fill="#ae644b" />
                        </svg>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl font-bold text-fika-900 mb-4 font-sans">Magic Nudges</h2>
                            <p className="text-fika-600 leading-relaxed font-sans">
                                We've surfaced small moments to help you reach out without the pressure. Perfect for 10 AM or 3 PM coffee breaks.
                            </p>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {nudges.length > 0 ? nudges.map(nudge => (
                                <div key={nudge.id} className="bg-fika-50/50 p-6 rounded-2xl border border-fika-100 hover:shadow-lg transition-all cursor-pointer group/nudge">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className={`w-8 h-8 rounded-full ${nudge.tier?.color} flex items-center justify-center text-white text-xs font-bold`}>
                                            {nudge.initial}
                                        </div>
                                        <span className="font-bold text-fika-800 font-sans">{nudge.name}</span>
                                    </div>
                                    <p className="text-sm text-fika-600 italic mb-6 font-sans">"{nudge.suggestion}"</p>
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(nudge.suggestion)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-fika-600 hover:text-fika-800 transition-colors font-sans"
                                        >
                                            Copy Message
                                        </button>
                                        <span className="text-[10px] text-orange-400 font-bold font-sans uppercase">Action Needed</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 flex items-center justify-center h-32 bg-fika-50/30 rounded-2xl border border-dashed border-fika-200">
                                    <p className="text-fika-400 font-medium font-sans">Everyone is currently warm. Relax and enjoy your coffee!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
};

export default RitualDashboard;
