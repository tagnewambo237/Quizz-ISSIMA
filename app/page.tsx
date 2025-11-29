"use client";

import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap, BookOpen, Lock, Clock, CheckCircle2,
  Shield, ArrowRight, Zap, Users, Award, BarChart3,
  Globe, Laptop, PlayCircle
} from "lucide-react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";

// Animation variants pour réutilisation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function Home() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white overflow-hidden">

      {/* --- BACKGROUND ACCENTS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Xkorin School Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Xkorin<span className="text-primary">School</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Fonctionnalités', 'L\'École', 'Témoignages', 'Contact'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-medium text-slate-700 hover:text-primary px-4 py-2">
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 hover:shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5"
            >
              Espace Membre
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32">

        {/* --- HERO SECTION --- */}
        <section ref={targetRef} className="container mx-auto px-6 mb-32 relative">
          <motion.div
            style={{ opacity, scale }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary/90 text-sm font-semibold mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nouvelle génération de plateforme éducative
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight"
            >
              L'excellence académique <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-primary bg-300% animate-gradient">
                à portée de main
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Une infrastructure numérique haut de gamme conçue pour les écoles d'élite.
              Gérez les examens, suivez les performances et connectez les talents de demain.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/register"
                className="group px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold text-lg hover:border-primary/30 hover:bg-primary/10 transition-all flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Démonstration
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Dashboard Preview Image */}
          <motion.div
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-primary blur-[80px] opacity-20 -z-10 rounded-full" />
            <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 shadow-2xl shadow-primary/10">
              <div className="rounded-xl overflow-hidden bg-slate-100 aspect-[16/9] relative">
                {/* Placeholder for Main Dashboard UI */}
                <Image
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop"
                  alt="Dashboard Interface"
                  fill
                  className="object-cover"
                />
                {/* Overlay UI Mockup Elements */}
                <div className="absolute top-4 left-4 right-4 h-12 bg-white/90 backdrop-blur rounded-lg flex items-center px-4 justify-between shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="h-2 w-32 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="py-12 border-y border-slate-200 bg-white/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Utilisateurs Actifs", value: "10k+", icon: Users },
                { label: "Taux de Réussite", value: "98%", icon: BarChart3 },
                { label: "Pays Couverts", value: "15+", icon: Globe },
                { label: "Examens Sécurisés", value: "1M+", icon: Shield },
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-4 p-3 bg-primary/10 rounded-2xl text-primary">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES BENTO GRID --- */}
        <section className="py-32 container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-3">Fonctionnalités Premium</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Tout ce dont une école moderne a besoin</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Nous avons repensé l'expérience d'évaluation pour la rendre plus fluide, plus sûre et plus intelligente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1 - Large */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 row-span-1 bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden group"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                    <Lock className="w-6 h-6 text-primary/40" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3">Technologie Anti-Triche Avancée</h4>
                  <p className="text-slate-400 max-w-md">Surveillance par IA, blocage du navigateur et détection de présence pour garantir l'intégrité de chaque diplôme délivré.</p>
                </div>
              </div>
              {/* Abstract decorative graphic */}
              <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-primary/30 to-transparent group-hover:from-primary/50 transition-all duration-500" />
              <Image
                src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop"
                alt="Code security"
                fill
                className="object-cover opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Clock className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Temps Réel</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Chronometrage précis à la seconde près. Sauvegarde automatique de chaque réponse.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors">
                <CheckCircle2 className="w-6 h-6 text-secondary group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Correction Auto</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Algorithmes de notation instantanée pour les QCM et suggestions IA pour les réponses ouvertes.
              </p>
            </motion.div>

            {/* Feature 4 - Large */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 row-span-1 bg-gradient-to-br from-primary to-purple-700 rounded-3xl p-10 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <Laptop className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">Nouveau</span>
                </div>
                <h4 className="text-2xl font-bold mb-3">Compatible Tous Supports</h4>
                <p className="text-primary/20 max-w-md">
                  Que vos étudiants soient sur tablette, mobile ou ordinateur, l'expérience reste fluide, native et optimisée.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </section>

        {/* --- 6 IMAGES GALLERY SECTION --- */}
        <section className="py-32 bg-slate-900 text-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">La Vie sur Xkorin</h2>
                <p className="text-slate-400 text-lg max-w-xl">
                  Découvrez comment notre plateforme s'intègre au quotidien des campus les plus prestigieux.
                </p>
              </div>
              <Link href="/gallery" className="text-white border-b border-primary pb-1 hover:text-primary/60 transition-colors">
                Voir toute la galerie
              </Link>
            </div>

            {/* Gallery Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
            >
              {[
                { src: "/1.jpeg", title: "Notre Campus", desc: "Un environnement propice à l'excellence" },
                { src: "/2.jpeg", title: "Vie Étudiante", desc: "Une communauté dynamique et soudée" },
                { src: "/3.jpeg", title: "Salles de Classe", desc: "Équipements modernes et connectés" },
                { src: "/4.jpeg", title: "Innovation", desc: "Laboratoires de dernière génération" },
                { src: "/5.jpeg", title: "Détente", desc: "Espaces de vie et de partage" },
                { src: "/2.jpeg", title: "Réussite", desc: "Célébrons chaque succès ensemble" },
              ].map((img, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-bold mb-1">{img.title}</h3>
                    <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">{img.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- TEXT & CONTENT SECTION --- */}
        <section className="py-32 container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Une pédagogie transformée par <span className="text-primary">l'intelligence des données</span>.
              </h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary/90 font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Conception intuitive des examens</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Créez des évaluations complexes en quelques minutes grâce à notre éditeur "Drag & Drop". Importez vos questions depuis Word ou Excel et laissez l'IA suggérer des variantes pour éviter la fraude.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary/90 font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Analyse granularité des résultats</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Ne vous contentez pas d'une note. Accédez à des rapports détaillés sur les lacunes des étudiants, le temps passé par question et la progression de la classe sur l'année.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary/90 font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Archivage sécurisé et conforme</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Toutes les données sont chiffrées de bout en bout et stockées sur des serveurs certifiés ISO. Vos archives académiques sont disponibles à vie, en un clic.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/1.jpeg"
                  alt="Teacher analyzing data"
                  width={800}
                  height={1000}
                  className="w-full h-auto"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute top-10 -left-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Taux de participation</p>
                  <p className="text-lg font-bold text-slate-900">98.5%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="container mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[3rem] bg-primary overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />

            <div className="relative z-10 px-6 py-24 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Prêt à transformer votre école ?</h2>
              <p className="text-primary/20 text-xl mb-10 max-w-2xl mx-auto">
                Rejoignez le cercle des institutions qui utilisent Xkorin School pour bâtir l'éducation de demain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
                >
                  Créer un compte enseignant
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                >
                  Contacter l'équipe
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative w-12 h-12">
                  <Image
                    src="/logo.png"
                    alt="Xkorin School Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-slate-900">Xkorin<span className="text-primary">School</span></span>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed max-w-sm">
                La plateforme de référence pour l'évaluation académique sécurisée. Conçue par des éducateurs, pour des éducateurs.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Plateforme</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Sécurité</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Mises à jour</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Légal</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">CGU</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Cookies</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© 2025 Xkorin School Inc. Tous droits réservés.</p>
            <div className="flex gap-6">
              {/* Social Icons placeholders */}
              <div className="w-6 h-6 bg-slate-200 rounded-full hover:bg-primary transition-colors cursor-pointer" />
              <div className="w-6 h-6 bg-slate-200 rounded-full hover:bg-primary transition-colors cursor-pointer" />
              <div className="w-6 h-6 bg-slate-200 rounded-full hover:bg-primary transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}