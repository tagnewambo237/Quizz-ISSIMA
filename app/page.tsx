"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, Lock, Clock, CheckCircle2, Shield, ArrowRight, Zap, Users, Award, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="Xkorin school"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </motion.div>

          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all"
            >
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <div className="container mx-auto px-6 mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-primary text-sm font-semibold mb-6">
                <Award className="w-4 h-4" />
                Plateforme d'évaluation universitaire
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                Examens en ligne
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  sécurisés et fiables
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Une solution complète pour créer, gérer et passer des examens en ligne avec une sécurité maximale et une expérience utilisateur optimale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?role=teacher"
                  className="group px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Espace Enseignant</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/register?role=student"
                  className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Espace Étudiant</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/students.png"
                  alt="Students studying"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl opacity-30" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-secondary to-primary rounded-full blur-3xl opacity-30" />
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour gérer vos examens de A à Z
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestion du temps</h3>
              <p className="text-gray-600 leading-relaxed">
                Définissez des plages horaires précises et des durées d'examen. Les étudiants peuvent reprendre leur examen sur n'importe quel appareil.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-secondary/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité renforcée</h3>
              <p className="text-gray-600 leading-relaxed">
                Codes d'accès tardif, modes de fermeture stricts ou permissifs, et tokens de reprise sécurisés pour une intégrité maximale.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Correction automatique</h3>
              <p className="text-gray-600 leading-relaxed">
                Les QCM sont corrigés automatiquement avec calcul instantané des scores. Résultats disponibles immédiatement après la soumission.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-primary via-blue-700 to-secondary p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center text-white">
              <div>
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-blue-100 font-medium">Sécurisé</div>
              </div>
              <div className="border-x border-white/20">
                <div className="text-5xl font-bold mb-2">24/7</div>
                <div className="text-green-100 font-medium">Support Actif</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">∞</div>
                <div className="text-blue-100 font-medium">Évolutivité</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-12 text-center border border-blue-100"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'enseignants et d'étudiants qui utilisent QuizLock pour leurs examens
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Créer un compte gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">QuizLock</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 QuizLock. Plateforme d'examens en ligne sécurisée.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
