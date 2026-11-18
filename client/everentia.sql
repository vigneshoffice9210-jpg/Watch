-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2026 at 12:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.3.36

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `everentia`
--

-- --------------------------------------------------------

--
-- Table structure for table `capsules`
--

CREATE TABLE `capsules` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(190) NOT NULL,
  `message` text NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `open_at` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `care_articles`
--

CREATE TABLE `care_articles` (
  `id` int(11) NOT NULL,
  `slug` varchar(190) NOT NULL,
  `title` varchar(190) NOT NULL,
  `category` varchar(80) NOT NULL,
  `excerpt` varchar(500) NOT NULL,
  `body` text NOT NULL,
  `read_minutes` int(11) NOT NULL DEFAULT 3,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `care_articles`
--

INSERT INTO `care_articles` (`id`, `slug`, `title`, `category`, `excerpt`, `body`, `read_minutes`, `created_at`) VALUES
(1, 'daily-care-basics', 'Daily care basics', 'Essentials', 'Simple habits that keep your timepiece looking new for years.', 'Wipe your watch with a soft microfibre cloth at the end of each day to remove oils and dust.\n\nKeep it away from strong magnets — speakers, phone cases and laptops can affect quartz and automatic movements.\n\nStore it in its box or a watch roll, dial up, away from direct sunlight.', 3, '2026-11-18 09:53:20'),
(2, 'leather-strap-care', 'Caring for leather straps', 'Straps', 'Keep leather supple and avoid cracks, stains and odours.', 'Leather and water do not mix. Remove leather-strap watches before washing hands, swimming or exercising.\n\nLet the strap breathe overnight, and condition it every few months with a small amount of leather balm.\n\nRotate between two straps if you wear the watch daily.', 4, '2026-11-18 09:53:20'),
(3, 'water-resistance-explained', 'Water resistance explained', 'Guides', 'What 30 m, 50 m, 100 m and 200 m really mean.', '30 m: splashes and rain only.\n50 m: hand washing and brief immersion, no swimming.\n100 m: swimming and snorkelling.\n200 m: diving and water sports.\n\nNever press buttons or open the crown under water, and get gaskets checked every two years.', 3, '2026-11-18 09:53:20'),
(4, 'battery-and-servicing', 'Battery & servicing', 'Service', 'When to change a battery and how often to service an automatic.', 'Quartz batteries last around 2–3 years. Replace a dead battery promptly to avoid leaks.\n\nAutomatic watches benefit from a full service every 4–5 years. If yours gains or loses more than 30 seconds a day, it is time.', 2, '2026-11-18 09:53:20'),
(5, 'cleaning-steel-bracelets', 'Cleaning steel bracelets', 'Straps', 'Bring back the shine on bracelets and mesh straps.', 'Use lukewarm water, a drop of mild soap and a soft toothbrush between the links (only if the watch is rated 50 m or more).\n\nRinse, pat dry and finish with a microfibre cloth. Avoid abrasive polishes on brushed finishes.', 3, '2026-11-18 09:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `community_posts`
--

CREATE TABLE `community_posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `author_name` varchar(120) NOT NULL,
  `caption` varchar(500) NOT NULL,
  `image` varchar(500) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `drops`
--

CREATE TABLE `drops` (
  `id` int(11) NOT NULL,
  `title` varchar(190) NOT NULL,
  `description` text DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `release_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drops`
--

INSERT INTO `drops` (`id`, `title`, `description`, `product_id`, `release_at`) VALUES
(1, 'The Shock Pro Release', 'Our toughest analog-digital piece lands in limited numbers. Pre-orders ship first.', 8, '2026-11-21 15:23:20'),
(2, 'Midnight Moon — Second Batch', 'The moonphase that sold out in a week returns for one more run.', 6, '2026-11-27 15:23:20'),
(3, 'Vault: Open Heart Edition', 'Only a handful of Open Heart pieces will be released through The Vault.', 14, '2026-12-09 15:23:20');

-- --------------------------------------------------------

--
-- Table structure for table `drop_alerts`
--

CREATE TABLE `drop_alerts` (
  `id` int(11) NOT NULL,
  `drop_id` int(11) NOT NULL,
  `contact` varchar(190) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(30) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(12) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `gift_wrap` tinyint(1) NOT NULL DEFAULT 0,
  `subtotal` decimal(10,2) NOT NULL,
  `shipping` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('cod','upi') NOT NULL DEFAULT 'cod',
  `payment_ref` varchar(120) DEFAULT NULL,
  `payment_status` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
  `status` enum('placed','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `name` varchar(190) NOT NULL,
  `brand` varchar(120) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `qty` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `business` varchar(190) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `partner_type` varchar(60) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','contacted','approved','rejected') NOT NULL DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `policies`
--

CREATE TABLE `policies` (
  `id` int(11) NOT NULL,
  `slug` varchar(80) NOT NULL,
  `title` varchar(190) NOT NULL,
  `body` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `policies`
--

INSERT INTO `policies` (`id`, `slug`, `title`, `body`, `sort_order`) VALUES
(1, 'shipping', 'Shipping', 'We ship across India. Orders are packed within 1–2 business days and usually arrive in 3–7 business days, depending on your PIN code.\n\nShipping is free on orders above ₹999. A flat ₹79 delivery fee applies to smaller orders.\n\nYou will receive tracking details on WhatsApp and email once your timepiece leaves our studio.', 0),
(2, 'returns', 'Returns & exchanges', 'If your watch arrives damaged or is not what you ordered, tell us within 48 hours of delivery with an unboxing video and we will arrange a free replacement or return.\n\nWatches must be unworn, with all tags, protective films and original packaging intact.\n\nPre-order and Vault pieces are final sale unless they arrive damaged.', 1),
(3, 'refunds', 'Refunds', 'Approved refunds are processed within 5–7 business days to your original payment method. Cash on Delivery orders are refunded by UPI or bank transfer.', 2),
(4, 'warranty', 'Warranty', 'Product imagery and warranties are subject to verification. Where a warranty applies, it covers movement defects and does not cover glass, straps, water damage or wear and tear.', 3),
(5, 'privacy', 'Privacy', 'We use your name, phone, email and address only to deliver and support your order. Wrist photos uploaded to the AI Try-On stay on your device and are never stored on our servers.\n\nWe never sell your information.', 4);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `slug` varchar(190) NOT NULL,
  `name` varchar(190) NOT NULL,
  `brand` varchar(120) NOT NULL,
  `type` enum('classic','sport','statement','dress','smart') NOT NULL DEFAULT 'classic',
  `gender` enum('men','women','unisex') NOT NULL DEFAULT 'unisex',
  `price` decimal(10,2) NOT NULL,
  `mrp` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_status` enum('in_stock','low_stock','preorder','out_of_stock') NOT NULL DEFAULT 'in_stock',
  `description` text DEFAULT NULL,
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specs`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `image` varchar(500) DEFAULT NULL,
  `try_on_image` varchar(500) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_new` tinyint(1) NOT NULL DEFAULT 0,
  `is_vault` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `slug`, `name`, `brand`, `type`, `gender`, `price`, `mrp`, `stock`, `stock_status`, `description`, `specs`, `tags`, `image`, `try_on_image`, `images`, `is_featured`, `is_new`, `is_vault`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'kairos-meridian-classic', 'Meridian Classic Ivory Dial', 'Kairos', 'classic', 'men', 2499.00, 3499.00, 12, 'in_stock', 'A warm gold case framing an ivory sunray dial, finished on a hand-stitched brown leather strap. A quiet dress watch made for evenings and boardrooms alike.', '{\"Case size\":\"40 mm\",\"Movement\":\"Japanese quartz\",\"Water resistance\":\"30 m\",\"Strap\":\"Genuine leather\",\"Glass\":\"Mineral crystal\"}', '[\"formal\",\"gift\",\"brown\",\"beige\"]', '/watches/kairos-meridian-classic.svg', '/watches/kairos-meridian-classic.svg', '[\"/watches/kairos-meridian-classic.svg\"]', 1, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(2, 'maison-orlo-noir-chronograph', 'Noir Gunmetal Chronograph-Style Watch', 'Maison Orlo', 'statement', 'men', 1699.00, 2399.00, 3, 'low_stock', 'Gunmetal case and bracelet with a deep black dial and three sub-dials. Bold, architectural and built to be noticed.', '{\"Case size\":\"44 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"50 m\",\"Strap\":\"Stainless steel bracelet\",\"Glass\":\"Mineral crystal\"}', '[\"party\",\"black\",\"grey\"]', '/watches/maison-orlo-noir-chronograph.svg', '/watches/maison-orlo-noir-chronograph.svg', '[\"/watches/maison-orlo-noir-chronograph.svg\"]', 1, 1, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(3, 'nordhavn-glacier-integrated', 'Glacier Ice Blue Integrated Bracelet', 'Nordhavn', 'sport', 'unisex', 2999.00, 3999.00, 2, 'low_stock', 'A cushion case flowing into an integrated steel bracelet, with an ice-blue textured dial that catches every angle of light.', '{\"Case size\":\"40 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"100 m\",\"Strap\":\"Integrated steel bracelet\",\"Glass\":\"Sapphire-coated\"}', '[\"casual\",\"blue\",\"white\",\"grey\"]', '/watches/nordhavn-glacier-integrated.svg', '/watches/nordhavn-glacier-integrated.svg', '[\"/watches/nordhavn-glacier-integrated.svg\"]', 1, 1, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(4, 'aeterna-rose-petite', 'Rose Petite Mesh Watch', 'Aeterna', 'dress', 'women', 1299.00, 1899.00, 18, 'in_stock', 'Delicate rose-gold tones, a blush dial and a fine Milanese mesh strap. Small in size, generous in presence.', '{\"Case size\":\"32 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"30 m\",\"Strap\":\"Milanese mesh\",\"Glass\":\"Mineral crystal\"}', '[\"formal\",\"gift\",\"pink\",\"beige\",\"white\"]', '/watches/aeterna-rose-petite.svg', '/watches/aeterna-rose-petite.svg', '[\"/watches/aeterna-rose-petite.svg\"]', 0, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(5, 'valmont-field-explorer', 'Field Explorer Olive Dial', 'Valmont & Co', 'sport', 'men', 899.00, 1299.00, 25, 'in_stock', 'Military-inspired legibility with bold numerals, an olive dial and a durable woven nylon strap. Ready for trails and weekdays.', '{\"Case size\":\"41 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"50 m\",\"Strap\":\"Nylon\",\"Glass\":\"Mineral crystal\"}', '[\"casual\",\"outdoor\",\"green\",\"brown\"]', '/watches/valmont-field-explorer.svg', '/watches/valmont-field-explorer.svg', '[\"/watches/valmont-field-explorer.svg\"]', 0, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(6, 'solenne-midnight-moon', 'Midnight Moonphase Gold', 'Solenne', 'statement', 'unisex', 4499.00, 5999.00, 6, 'in_stock', 'A navy dial scattered with a moonphase window, set in a polished gold case on navy leather with gold stitching.', '{\"Case size\":\"41 mm\",\"Movement\":\"Quartz with moonphase\",\"Water resistance\":\"30 m\",\"Strap\":\"Leather\",\"Glass\":\"Sapphire-coated\"}', '[\"formal\",\"party\",\"gift\",\"blue\",\"black\"]', '/watches/solenne-midnight-moon.svg', '/watches/solenne-midnight-moon.svg', '[\"/watches/solenne-midnight-moon.svg\"]', 1, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(7, 'kairos-tide-diver', 'Tide Diver Ocean Blue', 'Kairos', 'sport', 'men', 1999.00, 2799.00, 9, 'in_stock', 'A rotating black bezel and an ocean-blue dial on a comfortable rubber strap. Made for the water, styled for the street.', '{\"Case size\":\"42 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"200 m\",\"Strap\":\"Rubber\",\"Glass\":\"Mineral crystal\"}', '[\"casual\",\"outdoor\",\"blue\",\"black\"]', '/watches/kairos-tide-diver.svg', '/watches/kairos-tide-diver.svg', '[\"/watches/kairos-tide-diver.svg\"]', 0, 1, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:54'),
(8, 'nordhavn-shock-digital-pro', 'Shock Pro Analog-Digital Sports Watch', 'Nordhavn', 'sport', 'unisex', 1499.00, 2499.00, 0, 'preorder', 'Tough resin construction, analog-digital display, stopwatch and backlight. Built to take a hit and keep time.', '{\"Case size\":\"48 mm\",\"Movement\":\"Analog-digital quartz\",\"Water resistance\":\"200 m\",\"Strap\":\"Resin\",\"Features\":\"Stopwatch, alarm, LED light\"}', '[\"casual\",\"outdoor\",\"black\"]', '/watches/nordhavn-shock-digital-pro.svg', '/watches/nordhavn-shock-digital-pro.svg', '[\"/watches/nordhavn-shock-digital-pro.svg\"]', 1, 1, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(9, 'aeterna-heritage-gold', 'Heritage Champagne Gold', 'Aeterna', 'classic', 'men', 5499.00, 7499.00, 4, 'in_stock', 'A full gold bracelet watch with a champagne dial. A heritage piece meant to be handed down.', '{\"Case size\":\"40 mm\",\"Movement\":\"Automatic\",\"Water resistance\":\"50 m\",\"Strap\":\"Gold-tone steel bracelet\",\"Glass\":\"Sapphire crystal\"}', '[\"formal\",\"wedding\",\"gift\",\"beige\",\"brown\"]', '/watches/aeterna-heritage-gold.svg', '/watches/aeterna-heritage-gold.svg', '[\"/watches/aeterna-heritage-gold.svg\"]', 0, 0, 1, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(10, 'maison-orlo-slim-ivory', 'Slim Ivory Minimalist', 'Maison Orlo', 'dress', 'unisex', 699.00, 999.00, 30, 'in_stock', 'A 7 mm slim steel case with a clean white dial and black leather strap. Nothing more, nothing less.', '{\"Case size\":\"38 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"30 m\",\"Strap\":\"Leather\",\"Thickness\":\"7 mm\"}', '[\"formal\",\"casual\",\"white\",\"black\",\"grey\"]', '/watches/maison-orlo-slim-ivory.svg', '/watches/maison-orlo-slim-ivory.svg', '[\"/watches/maison-orlo-slim-ivory.svg\"]', 0, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(11, 'valmont-racing-chrono', 'Racing Panda Chronograph-Style', 'Valmont & Co', 'statement', 'men', 3299.00, 4499.00, 7, 'in_stock', 'A white panda dial with black sub-dials, a tachymeter bezel and a rally leather strap with red stitching.', '{\"Case size\":\"42 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"100 m\",\"Strap\":\"Rally leather\",\"Glass\":\"Mineral crystal\"}', '[\"casual\",\"party\",\"white\",\"black\",\"red\"]', '/watches/valmont-racing-chrono.svg', '/watches/valmont-racing-chrono.svg', '[\"/watches/valmont-racing-chrono.svg\"]', 0, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(12, 'solenne-emerald', 'Emerald Petite Bracelet', 'Solenne', 'classic', 'women', 2199.00, 2999.00, 11, 'in_stock', 'An emerald sunray dial in a slim gold case with a matching bracelet. Jewellery that tells time.', '{\"Case size\":\"34 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"30 m\",\"Strap\":\"Gold-tone bracelet\",\"Glass\":\"Mineral crystal\"}', '[\"formal\",\"wedding\",\"party\",\"gift\",\"green\"]', '/watches/solenne-emerald.svg', '/watches/solenne-emerald.svg', '[\"/watches/solenne-emerald.svg\"]', 1, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(13, 'kairos-essential-mini', 'Essential Mini Silver', 'Kairos', 'classic', 'unisex', 449.00, 699.00, 40, 'in_stock', 'An everyday essential with a crisp white dial and silver mesh strap. An easy first watch or a thoughtful small gift.', '{\"Case size\":\"34 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"30 m\",\"Strap\":\"Mesh\",\"Glass\":\"Mineral crystal\"}', '[\"casual\",\"gift\",\"white\",\"grey\"]', '/watches/kairos-essential-mini.svg', '/watches/kairos-essential-mini.svg', '[\"/watches/kairos-essential-mini.svg\"]', 0, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(14, 'aeterna-skeleton-open-heart', 'Open Heart Ice Blue – Dark Metal Edition', 'Aeterna', 'statement', 'men', 6499.00, 8999.00, 2, 'low_stock', 'A dark metal cushion case with an ice-blue textured dial and an open-heart aperture revealing the balance wheel.', '{\"Case size\":\"40 mm\",\"Movement\":\"Automatic, open heart\",\"Water resistance\":\"100 m\",\"Strap\":\"Integrated bracelet\",\"Glass\":\"Sapphire crystal\"}', '[\"party\",\"formal\",\"blue\",\"grey\",\"black\"]', '/watches/aeterna-skeleton-open-heart.svg', '/watches/aeterna-skeleton-open-heart.svg', '[\"/watches/aeterna-skeleton-open-heart.svg\"]', 1, 0, 1, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(15, 'nordhavn-pilot-aviator', 'Pilot Aviator Black', 'Nordhavn', 'sport', 'men', 1199.00, 1599.00, 0, 'out_of_stock', 'An oversized cockpit-inspired dial with luminous numerals on a vintage brown leather strap.', '{\"Case size\":\"45 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"50 m\",\"Strap\":\"Leather\",\"Glass\":\"Mineral crystal\"}', '[\"casual\",\"black\",\"brown\"]', '/watches/nordhavn-pilot-aviator.svg', '/watches/nordhavn-pilot-aviator.svg', '[\"/watches/nordhavn-pilot-aviator.svg\"]', 0, 0, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20'),
(16, 'maison-orlo-pearl-lady', 'Pearl Lady Mother-of-Pearl Dial', 'Maison Orlo', 'dress', 'women', 1799.00, 2299.00, 14, 'in_stock', 'A lustrous mother-of-pearl style dial in a petite steel case on a polished bracelet.', '{\"Case size\":\"30 mm\",\"Movement\":\"Quartz\",\"Water resistance\":\"30 m\",\"Strap\":\"Steel bracelet\",\"Glass\":\"Mineral crystal\"}', '[\"formal\",\"wedding\",\"gift\",\"white\",\"pink\",\"grey\"]', '/watches/maison-orlo-pearl-lady.svg', '/watches/maison-orlo-pearl-lady.svg', '[\"/watches/maison-orlo-pearl-lady.svg\"]', 0, 1, 0, 1, '2026-11-18 09:53:20', '2026-11-18 09:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `author_name` varchar(120) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` varchar(1000) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `author_name`, `rating`, `comment`, `created_at`) VALUES
(1, 1, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(2, 1, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(3, 9, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(4, 12, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(5, 13, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(6, 13, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(7, 3, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(8, 5, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(9, 5, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(10, 5, NULL, 'Rahul', 5, 'Tried it on with the AI try-on first — exactly how it looked.', '2026-11-18 09:53:20'),
(11, 7, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(12, 7, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(13, 8, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(14, 8, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(15, 8, NULL, 'Rahul', 5, 'Tried it on with the AI try-on first — exactly how it looked.', '2026-11-18 09:53:20'),
(16, 15, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(17, 2, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(18, 2, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(19, 2, NULL, 'Rahul', 5, 'Tried it on with the AI try-on first — exactly how it looked.', '2026-11-18 09:53:20'),
(20, 6, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(21, 11, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(22, 11, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(23, 11, NULL, 'Rahul', 5, 'Tried it on with the AI try-on first — exactly how it looked.', '2026-11-18 09:53:20'),
(24, 14, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(25, 14, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(26, 14, NULL, 'Rahul', 5, 'Tried it on with the AI try-on first — exactly how it looked.', '2026-11-18 09:53:20'),
(27, 4, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(28, 4, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(29, 10, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(30, 10, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20'),
(31, 16, NULL, 'Arjun', 5, 'Looks even better in person. Packaging was beautiful.', '2026-11-18 09:53:20'),
(32, 16, NULL, 'Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.', '2026-11-18 09:53:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `points` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `points`, `created_at`) VALUES
(1, 'Store Admin', 'admin@everentia.local', NULL, '$2a$10$8EWSCJyhSpIJDIaBacc8n.vhpAHvIO0H3yhe8T4MxILYiGyhNh65e', 'admin', 0, '2026-11-18 09:53:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `capsules`
--
ALTER TABLE `capsules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `care_articles`
--
ALTER TABLE `care_articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `community_posts`
--
ALTER TABLE `community_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `drops`
--
ALTER TABLE `drops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `drop_alerts`
--
ALTER TABLE `drop_alerts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_alert` (`drop_id`,`contact`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `policies`
--
ALTER TABLE `policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_products_brand` (`brand`),
  ADD KEY `idx_products_type` (`type`),
  ADD KEY `idx_products_price` (`price`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `capsules`
--
ALTER TABLE `capsules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `care_articles`
--
ALTER TABLE `care_articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `community_posts`
--
ALTER TABLE `community_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `drops`
--
ALTER TABLE `drops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `drop_alerts`
--
ALTER TABLE `drop_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `policies`
--
ALTER TABLE `policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `capsules`
--
ALTER TABLE `capsules`
  ADD CONSTRAINT `capsules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `capsules_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `community_posts`
--
ALTER TABLE `community_posts`
  ADD CONSTRAINT `community_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `community_posts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `drops`
--
ALTER TABLE `drops`
  ADD CONSTRAINT `drops_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `drop_alerts`
--
ALTER TABLE `drop_alerts`
  ADD CONSTRAINT `drop_alerts_ibfk_1` FOREIGN KEY (`drop_id`) REFERENCES `drops` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
