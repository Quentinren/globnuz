import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { fetchCountriesData, fetchPlacesData } from './services/globeDataService';
import Logo from './components/Logo'
import BottomMenu from './components/BottomMenu'
import GlobeDynamic from './components/GlobeDynamic';
import NewsScroll from './components/NewsScroll'; // Import our new component

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
    },
    {
      "title": "Au procès Sarkozy-Kadhafi, le parquet requiert sept ans de prison et 300 000 euros d'amende contre l'ancien président",
      "description": "Nicolas Sarkozy a dénoncé « l'outrance de la peine réclamée » par les procureurs, qui l'ont dépeint en « commanditaire » d'un pacte de corruption « inconcevable, inouï, indécent » noué avec l'ex-dictateur Mouammar Kadhafi.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/348/0/4208/2104/644/322/60/0/51c3e89_ftp-import-images-1-boqg7ohsn7pg-2025-03-27t162408z-719012113-rc2rldaiyhgi-rtrmadp-3-france-politics-sarkozy-trial.JPG",
      "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/proces-sarkozy-kadhafi-le-parquet-requiert-sept-ans-de-prison-et-300-000-euros-d-amende-contre-l-ex-president-de-la-republique_6586809_3224.html",
      "date": "March 27, 2025",
      "lat": 48.8566,
      "lng": 2.3522
    },
    {
      "title": "En direct, guerre en Ukraine : Volodymyr Zelensky appelle, depuis Paris, les Etats-Unis à « réagir » après de nouvelles attaques russes",
      "description": "Le président ukrainien a dénoncé la « violation » d'un moratoire, assez flou, sur les attaques contre les cibles énergétiques.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/468/0/5616/2808/644/322/60/0/e56429a_ftp-import-images-1-dmdjumc5fzzj-879347bd76da40d5a3f03268cbfa6249-0-35e8da7decf34f079d849f729438f14c.jpg",
      "externalLink": "https://www.lemonde.fr/international/live/2025/03/27/en-direct-guerre-en-ukraine-volodymyr-zelensky-appelle-depuis-paris-les-etats-unis-a-reagir-apres-de-nouvelles-frappes-russes_6584822_3210.html",
      "date": "March 27, 2025",
      "lat": 48.8566,
      "lng": 2.3522
    },
    {
      "title": "Droits de douane américains sur les voitures étrangères : des réactions inquiètes et hostiles dans le monde entier après l'annonce de Trump",
      "description": "Les pays européens envisagent une riposte commerciale alors que le Mexique promet « une réponse intégrale ». Les constructeurs automobiles, y compris américains, sont très pessimistes.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/545/0/6540/3270/644/322/60/0/f5fa8df_ftp-import-images-1-9pqjrsmlwgvt-fe16271b85a042dea5ad87fd11f75849-0-e2a881edab094662a266133059444fe3.jpg",
      "externalLink": "https://www.lemonde.fr/economie/article/2025/03/27/droits-de-douane-americains-sur-l-automobile-une-mesure-agressive-deplore-le-ministre-de-l-economie-francais_6586726_3234.html",
      "date": "March 27, 2025",
      "lat": 38.9072,
      "lng": -77.0369
    },
    {
      "title": "Un début de contestation contre le Hamas dans la bande de Gaza",
      "description": "Des centaines de personnes ont manifesté pour demander l'arrêt de la guerre et le départ du Hamas. Israël, le Fatah et les pays arabes cherchent à maintenir le mouvement islamiste hors de l'équation de l'après-guerre à Gaza.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/484/0/5808/2904/644/322/60/0/4829061_sirius-fs-upload-1-towcijv2yiwm-1743060999684-132935.jpg",
      "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/a-gaza-un-debut-de-contestation-contre-le-hamas_6586804_3210.html",
      "date": "March 27, 2025",
      "lat": 31.5017,
      "lng": 34.4668
    },
    {
      "title": "Pour les Britanniques, la guerre reste de l'histoire ancienne",
      "description": "« Les Européens, la guerre et la paix » (4/7). Au Royaume-Uni, l'armée jouit du prestige acquis lors des deux guerres mondiales, mais elle s'inquiète d'une menace perçue comme lointaine par l'opinion.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/26/339/0/4059/2029/644/322/60/0/b89dace_sirius-fs-upload-1-172pddonkssm-1742998274053-ap23316414301534.jpg",
      "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/pour-les-britanniques-la-guerre-demeure-de-l-histoire-ancienne_6586705_3210.html",
      "date": "March 27, 2025",
      "lat": 51.5074,
      "lng": -0.1278
    },
    {
      "title": "A Paris, grandes pelouses et moins de voitures place de la Concorde",
      "description": "La paysagiste Anne-Sylvie Bruel et l'architecte du patrimoine Philippe Prost ont été désignés, jeudi 27 mars, pour réaménager la plus grande place parisienne. Les travaux sont estimés entre 36 et 38 millions d'euros.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/236/0/2835/1417/644/322/60/0/0d9543f_sirius-fs-upload-1-vfw3x1na0hqx-1743092475017-concorde-vue-aerienne-projet-hd.jpg",
      "externalLink": "https://www.lemonde.fr/economie/article/2025/03/27/a-paris-grandes-pelouses-et-moins-de-voitures-place-de-la-concorde_6586822_3234.html",
      "date": "March 27, 2025",
      "lat": 48.8662,
      "lng": 2.3215
    },
    {
      "title": "L'administration Trump va supprimer 10 000 postes au ministère de la santé des Etats-Unis",
      "description": "Cette « restructuration majeure » concerne des agences supervisées par le ministère, notamment celles chargées de la réponse aux épidémies ou de l'approbation de nouveaux médicaments.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/584/0/7040/3520/644/322/60/0/19a7eb4_ftp-import-images-1-fwbuge5h40tf-5437211-01-06.jpg",
      "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/le-ministere-de-la-sante-americain-annonce-10-000-suppressions-d-emplois_6586799_3210.html",
      "date": "March 27, 2025",
      "lat": 38.9072,
      "lng": -77.0369
    },
    {
      "title": "En direct, guerre à Gaza : l'ONU prévient que les réserves d'aide alimentaire seront épuisées d'ici à deux semaines",
      "description": "Le Programme alimentaire mondial des Nations unies a prévenu que la faim menaçait de nouveau l'enclave depuis la reprise des bombardements et des opérations militaires israéliennes.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/408/0/4898/2449/644/322/60/0/06ebdfc_ftp-import-images-1-mum90ggxuj7i-5436579-01-06.jpg",
      "externalLink": "https://www.lemonde.fr/international/live/2025/03/27/en-direct-guerre-a-gaza-l-onu-previent-que-les-reserves-d-aide-alimentaire-seront-epuisees-d-ici-a-deux-semaines_6585700_3210.html",
      "date": "March 27, 2025",
      "lat": 31.5017,
      "lng": 34.4668
    },
    {
      "title": "Mort du petit Emile : la fin des gardes à vue des proches ne signifie pas l'abandon de la piste familiale, selon le procureur",
      "description": "Les grands-parents, un oncle et une tante ont été relâchés sans poursuite. Les enquêteurs jugent désormais probable « l'intervention d'un tiers » et privilégient la piste criminelle.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/885/0/6000/3000/644/322/60/0/5f15101_sirius-fs-upload-1-6r63f6gdevmn-1743062770212-127210.jpg",
      "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/affaire-du-petit-emile-la-fin-des-gardes-a-vue-ne-signifie-pas-l-abandon-de-la-piste-intrafamiliale-selon-le-procureur_6586792_3224.html",
      "date": "March 27, 2025",
      "lat": 43.9367,
      "lng": 6.1261
    },
    {
      "title": "Procès Depardieu : le parquet requiert dix-huit mois de prison avec sursis contre l'acteur, jugé pour agressions sexuelles",
      "description": "Le procureur a également demandé une amende de 20 000 euros, l'indemnisation des parties civiles, une obligation de soins psychologiques et l'inscription au fichier des auteurs d'infractions sexuelles",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/569/0/5176/2588/644/322/60/0/b34f0a8_ftp-import-images-1-qnj30os6bykq-2025-03-27t101508z-1067898863-rc2mldai149n-rtrmadp-3-people-depardieu-trial.JPG",
      "externalLink": "https://www.lemonde.fr/societe/article/2025/03/27/proces-depardieu-le-parquet-requiert-dix-huit-mois-de-prison-avec-sursis-contre-l-acteur-juge-pour-agressions-sexuelles_6586793_3224.html",
      "date": "March 27, 2025",
      "lat": 48.8566,
      "lng": 2.3522
    },
    {
      "title": "Attaque au couteau à Amsterdam : au moins cinq personnes blessées, un suspect arrêté et « aucune information sur la cause ou le mobile »",
      "description": "La police a précisé avoir mis en place un cordon de sécurité autour du lieu de l'incident, près de la place du Dam, dans le centre-ville, jeudi. L'état de santé des blessés n'a pas été communiqué dans l'immédiat.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/691/0/8268/4134/644/322/60/0/b27ce34_ftp-import-images-1-s66gmrih3gi6-bc36d11a1c134fd89cf479990e81d0b7-0-e46fe5defe8d4ce88e0a3f31ea294baf.jpg",
      "externalLink": "https://www.lemonde.fr/international/article/2025/03/27/a-amsterdam-au-moins-cinq-personnes-blessees-dans-une-attaque-au-couteau_6586816_3210.html",
      "date": "March 27, 2025",
      "lat": 52.3676,
      "lng": 4.9041
    },
    {
      "title": "Sénégal : le FMI confirme que Macky Sall a laissé 7 milliards de dollars de dettes cachées",
      "description": "Le chef de la division Afrique du FMI, Edward Gemayel, pointe les « graves lacunes dans le contrôle budgétaire » de la précédente présidence du pays.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2023/07/03/0/0/2160/1080/644/322/60/0/34bb142_5692562-01-06.jpg",
      "externalLink": "https://www.lemonde.fr/afrique/article/2025/03/27/senegal-le-fmi-confirme-que-macky-sall-a-laisse-7-milliards-de-dollars-de-dettes-cachees_6586825_3212.html",
      "date": "March 27, 2025",
      "lat": 14.7167,
      "lng": -17.4677
    },
    {
      "title": "Le Soudan du Sud au bord de la guerre civile après le placement en résidence surveillée du vice-président Riek Machar",
      "description": "Après l'intervention des forces du président Salva Kiir, mercredi, l'opposition a annoncé l'abrogation de l'accord de paix de 2018, faisant craindre une reprise du conflit qui avait fait rage durant cinq ans.",
      "author": "Le Monde",
      "newspaper": "Le Monde",
      "image": "https://img.lemde.fr/2025/03/27/0/0/4000/2000/644/322/60/0/bb39de3_ftp-import-images-1-tt3xwmhbcmsk-5433065-01-06.jpg",
      "externalLink": "https://www.lemonde.fr/afrique/article/2025/03/27/soudan-du-sud-le-placement-en-residence-surveillee-du-vice-president-riek-machar-precipite-le-pays-vers-la-guerre-civile_6586817_3212.html",
      "date": "March 27, 2025",
      "lat": 4.8594,
      "lng": 31.5713
    }
  ];
  
  // Function to handle navigation from NewsCard or NewsScroll
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
      
      {/* Our new NewsScroll component */}
      <NewsScroll 
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