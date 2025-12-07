import { useState } from "react";
import { X, Link, Mail, FileSpreadsheet, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InviteByLink } from "./InviteByLink";
import { InviteManual } from "./InviteManual";
import { InviteImport } from "./InviteImport";
import { InvitationLinksManager } from "./InvitationLinksManager";

interface StudentInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StudentInvitationModal({ isOpen, onClose }: StudentInvitationModalProps) {
    const [activeTab, setActiveTab] = useState<'link' | 'manual' | 'import' | 'manage'>('link');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inviter des élèves</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex px-6 pt-6 gap-2 bg-white dark:bg-gray-800 overflow-x-auto">
                                <TabButton
                                    active={activeTab === 'link'}
                                    onClick={() => setActiveTab('link')}
                                    icon={<Link className="h-4 w-4" />}
                                    label="Par lien"
                                />
                                <TabButton
                                    active={activeTab === 'manual'}
                                    onClick={() => setActiveTab('manual')}
                                    icon={<Mail className="h-4 w-4" />}
                                    label="Manuel"
                                />
                                <TabButton
                                    active={activeTab === 'import'}
                                    onClick={() => setActiveTab('import')}
                                    icon={<FileSpreadsheet className="h-4 w-4" />}
                                    label="Import"
                                />
                                <TabButton
                                    active={activeTab === 'manage'}
                                    onClick={() => setActiveTab('manage')}
                                    icon={<Settings className="h-4 w-4" />}
                                    label="Gérer liens"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {activeTab === 'link' && <InviteByLink />}
                                        {activeTab === 'manual' && <InviteManual />}
                                        {activeTab === 'import' && <InviteImport />}
                                        {activeTab === 'manage' && <InvitationLinksManager />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-t-xl text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${active
                ? "border-secondary text-secondary bg-secondary/5"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
