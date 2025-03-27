import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import Logo from './components/Logo'
import BottomMenu from './components/BottomMenu'
import GlobeDynamic from './components/GlobeDynamic';
import CustomNewsScroll from './components/CustomNewsScroll'; // Import our new component

function App() {
  // State to manage submenu opening
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  
  // New state to track selected coordinates for the globe
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  // Sample news events data
  const newsEvents = [
    {
      "title": "\"Solidarité Congo\" : un concert caritatif fait polémique",
      "description": "En France, l'événement caritatif \"Solidarité Congo\" prévu le 7 avril à Paris suscite des tensions. En cause, la date choisie par les organisateurs qui correspond à la Journée de commémoration du génocide des Tutsi",
      "author": "FRANCE24",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/1313fc74-0af8-11f0-b064-005056a97e36/w:1024/p:16x9/Miniature%20-%2016x9.jpg",
      "externalLink": "https://www.france24.com/fr/vid%C3%A9o/20250327-solidarit%C3%A9-congo-un-concert-caritatif-fait-pol%C3%A9mique",
      "date": "Thu, 27 Mar 2025 11:34:20 GMT",
      "lat": 48.8566,
      "lng": 2.3522
    },
    {
      "title": "Exposition \"Paris Noir\" : 150 artistes africains et caribéens mis en lumière",
      "description": "Imaginer un temps, où Paris fut un laboratoire d'émancipation pour les artistes africains et caribéens. Tous ont en commun l'histoire de l'esclavage et de la colonisation. L'exposition \"Paris Noir\" au centre Pompidou, rassemble les œuvres de ces artistes souvent mal connus, dont l'art a pourtant eu un impact majeur dans les luttes anticoloniales.",
      "author": "Louise DUPONT",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/7db44302-0b09-11f0-b6e0-005056bfb2b6/w:1024/p:16x9/EN%20NW%20OOV%20PARIS%20NOIR%20%20-DI%20BIASIO%20Laura-.transfer_frame_103.jpeg",
      "externalLink": "https://www.france24.com/fr/%C3%A9missions/%C3%A0-l-affiche/20250327-exposition-paris-noir-150-artistes-africains-et-carib%C3%A9ens-mis-en-lumi%C3%A8re",
      "date": "Thu, 27 Mar 2025 13:55:16 GMT",
      "lat": 48.8566,
      "lng": 2.3522
    },
    {
      "title": "Joseph Aoun, président du Liban : \"Les États-Unis et la France sont les garants du cessez-le-feu\"",
      "description": "À la veille de sa première visite officielle en France et de sa rencontre avec le président Emmanuel Macron, le chef de l'État libanais, Joseph Aoun, a accordé un entretien exclusif à France 24. Il revient notamment sur les conditions posées par Paris à la tenue d'une conférence de soutien au Liban, sur le processus de désarmement du Hezbollah, et sur les relations entre le Liban et Israël.",
      "author": "Michel KIK",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/4f2d934c-0b10-11f0-b204-005056bfb2b6/w:1024/p:16x9/pdt%20libanais.jpg",
      "externalLink": "https://www.france24.com/fr/%C3%A9missions/en-t%C3%AAte-%C3%A0-t%C3%AAte/20250327-joseph-aoun-pr%C3%A9sident-du-liban-les-%C3%A9tats-unis-et-la-france-sont-les-garants-du-cessez-le-feu",
      "date": "Thu, 27 Mar 2025 13:41:07 GMT",
      "lat": 48.8566,
      "lng": 2.3522
    },
    {
      "title": "Procès pour agressions sexuelles : 18 mois de prison avec sursis requis contre Gérard Depardieu",
      "description": "Le parquet a requis, jeudi, 18 mois de prison avec sursis contre Gérard Depardieu, accusé d'agressions sexuelles sur deux femmes lors du tournage du film \"Les Volets verts\" en 2021.",
      "author": "FRANCE 24",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/b1c6c328-0b12-11f0-b676-005056bf30b7/w:1024/p:16x9/000_383J662.jpg",
      "externalLink": "https://www.france24.com/fr/info-en-continu/20250327-%F0%9F%94%B4-proc%C3%A8s-pour-agressions-sexuelles-18-mois-de-prison-avec-sursis-requis-contre-g%C3%A9rard-depardieu",
      "date": "Thu, 27 Mar 2025 13:26:30 GMT",
      "lat": 48.8566,
      "lng": 2.3522
    },
    {
      "title": "Réforme de la justice en Israël : Benjamin Netanyahu ne lâche rien",
      "description": "Le Parlement israélien a adopté, jeudi matin, une loi polémique qui renforce l'influence du pouvoir politique dans la nomination des juges, un vote immédiatement contesté par l'opposition devant la Cour suprême. Ce vote a provoqué les manifestations les plus importantes de l'histoire du pays.",
      "author": "FRANCE 24",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/b2aa8e0c-08f4-11f0-82c0-005056a97e36/w:1024/p:16x9/2025-03-19T124918Z_1407942852_RC2CGDAVF3ER_RTRMADP_3_ISRAEL-PALESTINIANS-PROTESTS.JPG",
      "externalLink": "https://www.france24.com/fr/moyen-orient/20250327-israel-reforme-justice-benjamin-netanyahu-nomination-juges-opposition-cour-supreme",
      "date": "Thu, 27 Mar 2025 11:43:32 GMT",
      "lat": 31.7683,
      "lng": 35.2137
    },
    {
      "title": "\"Dette cachée\" au Sénégal : le Pastef réagit aux déclarations du FMI",
      "description": "Au Sénégal, le Fonds monétaire international a révélé ce mardi qu'entre 2019 et 2024, une dette d'un montant de 7 milliards de dollars environ a été \"cachée\" par l'administration de Macky Sall, le président sortant. Une affirmation qui confirme la cour des comptes sénégalaise. Dans un rapport publié en février 2025, l'organe avait soulevé une dette largement sous-évaluée par le régime sortant. Les précisions de notre correspondant, Elimane Ndao.",
      "author": "FRANCE24",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/183ce48e-0aff-11f0-bf09-005056bf30b7/w:1024/p:16x9/FR_20250326_225347_225522_CS.jpg",
      "externalLink": "https://www.france24.com/fr/vid%C3%A9o/20250327-dette-cach%C3%A9e-au-s%C3%A9n%C3%A9gal-le-pastef-r%C3%A9agit-aux-d%C3%A9clarations-du-fmi",
      "date": "Thu, 27 Mar 2025 11:32:06 GMT",
      "lat": 14.7167,
      "lng": -17.4677
    },
    {
      "title": "Narcotrafic : une guerre tentaculaire ? Parlons-en avec Frédéric Saliba et Pierre Gaussens",
      "description": "Au Mexique, 120 000 personnes sont portées disparues dans ce pays gangrené par la violence liée au trafic de drogue orchestré par les cartels. Un abysse qui a connu une illustration sordide ces dernières semaines : la découverte de \"ranchs de l'horreur\" dans lesquels ont été probablement exécutées des centaines de petites mains des narcotrafiquants. Comment est-ce possible dans ce pays qui a déclaré la guerre aux cartels il y a près de 20 ans ? Avec quelles armes peut-on lutter contre les narcotrafiquants au Mexique, en Colombie et contre leurs réseaux aux Etats-Unis ou en Europe ? Peut-on véritablement gagner la guerre tentaculaire ?",
      "author": "Pauline PACCARD",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/d04876b2-0af8-11f0-96ff-005056bfb2b6/w:1024/p:16x9/FRAN250327-1000-Live_CS1000.jpg",
      "externalLink": "https://www.france24.com/fr/%C3%A9missions/parlons-en-les-invit%C3%A9s/20250327-narcotrafic-une-guerre-tentaculaire-parlons-en-avec-fr%C3%A9d%C3%A9ric-saliba-et-pierre-gaussens",
      "date": "Thu, 27 Mar 2025 11:31:27 GMT",
      "lat": 19.4326,
      "lng": -99.1332
    },
    {
      "title": "Centrafrique : la pénurie d'eau rend plus difficile le Ramadan",
      "description": "Depuis plus de trois semaines, les habitants de Bangui font face à une importante pénurie d'eau. Cette situation touche des milliers de familles. Les musulmans en particulier en pâtissent pendant ce mois de Ramadan où l'eau est essentielle pour la préparation des repas et l'hydratation après le jeûne. Reportage de notre correspondant, Pacôme Pabanji.",
      "author": "FRANCE24",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/cd2eb788-0afe-11f0-9a3f-005056bf30b7/w:1024/p:16x9/FR_20250326_225157_225346_CS.jpg",
      "externalLink": "https://www.france24.com/fr/vid%C3%A9o/20250327-centrafrique-la-p%C3%A9nurie-d-eau-rend-plus-difficile-le-ramadan",
      "date": "Thu, 27 Mar 2025 11:30:01 GMT",
      "lat": 4.3947,
      "lng": 18.5582
    },
    {
      "title": "Tensions Tchad-Soudan : les craintes d'un conflit dans les villages frontaliers",
      "description": "Les tensions entre le Soudan et le Tchad ne retombent pas. Les officiels soudanais menacent régulièrement le Tchad d'une attaque à grande échelle. Ils considèrent que le Tchad soutient la rébellion sur leur sol. Dans les territoires tchadiens, frontaliers du Soudan, les civils craignent d'être les premières victimes d'un conflit entre les deux pays. Reportage de notre correspondant, Harold Girard.",
      "author": "FRANCE24",
      "newspaper": "France 24",
      "image": "https://s.france24.com/media/display/16635140-0afd-11f0-93df-005056a90284/w:1024/p:16x9/FR_20250326_224908_225118_CS.jpg",
      "externalLink": "https://www.france24.com/fr/vid%C3%A9o/20250327-tensions-tchad-soudan-les-craintes-d-un-conflit-dans-les-villages-frontaliers",
      "date": "Thu, 27 Mar 2025 11:17:45 GMT",
      "lat": 12.1348,
      "lng": 15.0557
    }
  ];
  
  // Function to handle navigation from NewsCard or CustomNewsScroll
  const handleNavigateToArticle = (lat, lng) => {
    setSelectedCoordinates({ lat, lng });
  };

  // Custom event handler for submenu state
  const handleSubmenuToggle = (isOpen) => {
    setIsSubmenuOpen(isOpen);
  };

  return (
    <div className={`app-container ${isSubmenuOpen ? 'submenu-open' : ''}`}>
      {/* Logo */}
      <Logo/>
      
      {/* Our new CustomNewsScroll component */}
      <CustomNewsScroll 
        newsEvents={newsEvents}
        onNavigateToArticle={handleNavigateToArticle}
      />
      
      {/* Globe */}
      <GlobeDynamic 
        newsEvents={newsEvents}
        navigateToCoordinates={selectedCoordinates} 
      />
      
      {/* Menus */}
      <BottomMenu onSubmenuToggle={handleSubmenuToggle} />
      
      {/* Gradient overlay - moved to end to ensure proper layering */}
      <div className="gradient-overlay"></div>
    </div>
  );
}

export default App;