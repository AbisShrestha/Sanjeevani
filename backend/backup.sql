--
-- PostgreSQL database dump
--

\restrict gWNILChTdeRTNsJg5GOaZXf7G0H0M5JnfVstI5vmXZo0w4pdtwQqbhfsB4vwear

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.userhealthinputs DROP CONSTRAINT userhealthinputs_userid_fkey;
ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_userid_fkey;
ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_medicineid_fkey;
ALTER TABLE ONLY public.reminders DROP CONSTRAINT reminders_userid_fkey;
ALTER TABLE ONLY public.reminders DROP CONSTRAINT reminders_medicineid_fkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_userid_fkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_orderid_fkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_medicineid_fkey;
ALTER TABLE ONLY public.medicines DROP CONSTRAINT medicines_categoryid_fkey;
ALTER TABLE ONLY public.medical_reports DROP CONSTRAINT medical_reports_userid_fkey;
ALTER TABLE ONLY public.consultations DROP CONSTRAINT consultations_userid_fkey;
ALTER TABLE ONLY public.consultations DROP CONSTRAINT consultations_doctorid_fkey;
ALTER TABLE ONLY public.articles DROP CONSTRAINT articles_authorid_fkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
ALTER TABLE ONLY public.userhealthinputs DROP CONSTRAINT userhealthinputs_pkey;
ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_userid_medicineid_key;
ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
ALTER TABLE ONLY public.reminders DROP CONSTRAINT reminders_pkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_pkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_pkey;
ALTER TABLE ONLY public.medicines DROP CONSTRAINT medicines_pkey;
ALTER TABLE ONLY public.medical_reports DROP CONSTRAINT medical_reports_pkey;
ALTER TABLE ONLY public.doctors DROP CONSTRAINT doctors_pkey;
ALTER TABLE ONLY public.consultations DROP CONSTRAINT consultations_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_unique;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_key;
ALTER TABLE ONLY public.articles DROP CONSTRAINT articles_pkey;
ALTER TABLE public.users ALTER COLUMN userid DROP DEFAULT;
ALTER TABLE public.userhealthinputs ALTER COLUMN inputid DROP DEFAULT;
ALTER TABLE public.reviews ALTER COLUMN reviewid DROP DEFAULT;
ALTER TABLE public.reminders ALTER COLUMN reminderid DROP DEFAULT;
ALTER TABLE public.orders ALTER COLUMN orderid DROP DEFAULT;
ALTER TABLE public.order_items ALTER COLUMN orderitemid DROP DEFAULT;
ALTER TABLE public.medicines ALTER COLUMN medicineid DROP DEFAULT;
ALTER TABLE public.medical_reports ALTER COLUMN reportid DROP DEFAULT;
ALTER TABLE public.doctors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.consultations ALTER COLUMN consultationid DROP DEFAULT;
ALTER TABLE public.categories ALTER COLUMN categoryid DROP DEFAULT;
ALTER TABLE public.articles ALTER COLUMN articleid DROP DEFAULT;
DROP SEQUENCE public.users_userid_seq;
DROP TABLE public.users;
DROP SEQUENCE public.userhealthinputs_inputid_seq;
DROP TABLE public.userhealthinputs;
DROP SEQUENCE public.reviews_reviewid_seq;
DROP TABLE public.reviews;
DROP SEQUENCE public.reminders_reminderid_seq;
DROP TABLE public.reminders;
DROP SEQUENCE public.orders_orderid_seq;
DROP TABLE public.orders;
DROP SEQUENCE public.order_items_orderitemid_seq;
DROP TABLE public.order_items;
DROP SEQUENCE public.medicines_medicineid_seq;
DROP TABLE public.medicines;
DROP SEQUENCE public.medical_reports_reportid_seq;
DROP TABLE public.medical_reports;
DROP SEQUENCE public.doctors_id_seq1;
DROP TABLE public.doctors;
DROP SEQUENCE public.consultations_consultationid_seq;
DROP TABLE public.consultations;
DROP SEQUENCE public.categories_categoryid_seq;
DROP TABLE public.categories;
DROP SEQUENCE public.articles_articleid_seq;
DROP TABLE public.articles;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.articles (
    articleid integer NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    imageurl text,
    authorid integer,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.articles OWNER TO sanjeevani_user;

--
-- Name: articles_articleid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.articles_articleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_articleid_seq OWNER TO sanjeevani_user;

--
-- Name: articles_articleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.articles_articleid_seq OWNED BY public.articles.articleid;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.categories (
    categoryid integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO sanjeevani_user;

--
-- Name: categories_categoryid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.categories_categoryid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_categoryid_seq OWNER TO sanjeevani_user;

--
-- Name: categories_categoryid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.categories_categoryid_seq OWNED BY public.categories.categoryid;


--
-- Name: consultations; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.consultations (
    consultationid integer NOT NULL,
    userid integer,
    doctorid integer,
    scheduledat timestamp without time zone NOT NULL,
    meetinglink text,
    status character varying(20) DEFAULT 'scheduled'::character varying
);


ALTER TABLE public.consultations OWNER TO sanjeevani_user;

--
-- Name: consultations_consultationid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.consultations_consultationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultations_consultationid_seq OWNER TO sanjeevani_user;

--
-- Name: consultations_consultationid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.consultations_consultationid_seq OWNED BY public.consultations.consultationid;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    specialty character varying(255) NOT NULL,
    qualification character varying(255),
    experience character varying(100),
    rating numeric(2,1) DEFAULT 5.0,
    image text,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hospital character varying(255),
    phone character varying(50),
    bio text
);


ALTER TABLE public.doctors OWNER TO sanjeevani_user;

--
-- Name: doctors_id_seq1; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.doctors_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq1 OWNER TO sanjeevani_user;

--
-- Name: doctors_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.doctors_id_seq1 OWNED BY public.doctors.id;


--
-- Name: medical_reports; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.medical_reports (
    reportid integer NOT NULL,
    userid integer,
    filename character varying(255) NOT NULL,
    originalname character varying(255) NOT NULL,
    filesize integer NOT NULL,
    mimetype character varying(100) NOT NULL,
    uploadedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medical_reports OWNER TO sanjeevani_user;

--
-- Name: medical_reports_reportid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.medical_reports_reportid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_reports_reportid_seq OWNER TO sanjeevani_user;

--
-- Name: medical_reports_reportid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.medical_reports_reportid_seq OWNED BY public.medical_reports.reportid;


--
-- Name: medicines; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.medicines (
    medicineid integer NOT NULL,
    name character varying(100) NOT NULL,
    categoryid integer,
    description text,
    dosage text,
    benefits text,
    usageinstructions text,
    precautions text,
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0,
    imageurl text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lowstockthreshold integer DEFAULT 5,
    isactive boolean DEFAULT true,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medicines OWNER TO sanjeevani_user;

--
-- Name: medicines_medicineid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.medicines_medicineid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicines_medicineid_seq OWNER TO sanjeevani_user;

--
-- Name: medicines_medicineid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.medicines_medicineid_seq OWNED BY public.medicines.medicineid;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.order_items (
    orderitemid integer NOT NULL,
    orderid integer,
    medicineid integer,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO sanjeevani_user;

--
-- Name: order_items_orderitemid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.order_items_orderitemid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_orderitemid_seq OWNER TO sanjeevani_user;

--
-- Name: order_items_orderitemid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.order_items_orderitemid_seq OWNED BY public.order_items.orderitemid;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.orders (
    orderid integer NOT NULL,
    userid integer,
    totalamount numeric(10,2) NOT NULL,
    shippingaddress text NOT NULL,
    paymentmethod character varying(50) DEFAULT 'eSewa'::character varying,
    paymentstatus character varying(50) DEFAULT 'Completed'::character varying,
    orderstatus character varying(50) DEFAULT 'Processing'::character varying,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO sanjeevani_user;

--
-- Name: orders_orderid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.orders_orderid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_orderid_seq OWNER TO sanjeevani_user;

--
-- Name: orders_orderid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.orders_orderid_seq OWNED BY public.orders.orderid;


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.reminders (
    reminderid integer NOT NULL,
    userid integer,
    medicineid integer,
    nextpurchasedate date NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reminders OWNER TO sanjeevani_user;

--
-- Name: reminders_reminderid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.reminders_reminderid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reminders_reminderid_seq OWNER TO sanjeevani_user;

--
-- Name: reminders_reminderid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.reminders_reminderid_seq OWNED BY public.reminders.reminderid;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.reviews (
    reviewid integer NOT NULL,
    userid integer,
    medicineid integer,
    rating integer,
    comment text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO sanjeevani_user;

--
-- Name: reviews_reviewid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.reviews_reviewid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_reviewid_seq OWNER TO sanjeevani_user;

--
-- Name: reviews_reviewid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.reviews_reviewid_seq OWNED BY public.reviews.reviewid;


--
-- Name: userhealthinputs; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.userhealthinputs (
    inputid integer NOT NULL,
    userid integer,
    bmi numeric(5,2),
    lifestylenotes text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.userhealthinputs OWNER TO sanjeevani_user;

--
-- Name: userhealthinputs_inputid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.userhealthinputs_inputid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.userhealthinputs_inputid_seq OWNER TO sanjeevani_user;

--
-- Name: userhealthinputs_inputid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.userhealthinputs_inputid_seq OWNED BY public.userhealthinputs.inputid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sanjeevani_user
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    fullname character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    passwordhash text NOT NULL,
    phone character varying(20),
    role character varying(20) DEFAULT 'user'::character varying,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    isactive boolean DEFAULT true,
    profileimage character varying(500),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'doctor'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO sanjeevani_user;

--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: sanjeevani_user
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_userid_seq OWNER TO sanjeevani_user;

--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sanjeevani_user
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: articles articleid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.articles ALTER COLUMN articleid SET DEFAULT nextval('public.articles_articleid_seq'::regclass);


--
-- Name: categories categoryid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN categoryid SET DEFAULT nextval('public.categories_categoryid_seq'::regclass);


--
-- Name: consultations consultationid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.consultations ALTER COLUMN consultationid SET DEFAULT nextval('public.consultations_consultationid_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq1'::regclass);


--
-- Name: medical_reports reportid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.medical_reports ALTER COLUMN reportid SET DEFAULT nextval('public.medical_reports_reportid_seq'::regclass);


--
-- Name: medicines medicineid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.medicines ALTER COLUMN medicineid SET DEFAULT nextval('public.medicines_medicineid_seq'::regclass);


--
-- Name: order_items orderitemid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN orderitemid SET DEFAULT nextval('public.order_items_orderitemid_seq'::regclass);


--
-- Name: orders orderid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN orderid SET DEFAULT nextval('public.orders_orderid_seq'::regclass);


--
-- Name: reminders reminderid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reminders ALTER COLUMN reminderid SET DEFAULT nextval('public.reminders_reminderid_seq'::regclass);


--
-- Name: reviews reviewid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reviews ALTER COLUMN reviewid SET DEFAULT nextval('public.reviews_reviewid_seq'::regclass);


--
-- Name: userhealthinputs inputid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.userhealthinputs ALTER COLUMN inputid SET DEFAULT nextval('public.userhealthinputs_inputid_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.articles (articleid, title, content, imageurl, authorid, createdat) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.categories (categoryid, name, description) FROM stdin;
1	Herbs	\N
2	Capsule	\N
3	Tablet	\N
4	Oil	\N
5	Syrup	\N
6	Powder	\N
\.


--
-- Data for Name: consultations; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.consultations (consultationid, userid, doctorid, scheduledat, meetinglink, status) FROM stdin;
1	6	7	2026-03-23 04:15:00	https://meet.jit.si/Sanjeevani-7-6-1774163181625	scheduled
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.doctors (id, name, specialty, qualification, experience, rating, image, is_available, created_at, hospital, phone, bio) FROM stdin;
\.


--
-- Data for Name: medical_reports; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.medical_reports (reportid, userid, filename, originalname, filesize, mimetype, uploadedat) FROM stdin;
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.medicines (medicineid, name, categoryid, description, dosage, benefits, usageinstructions, precautions, price, stock, imageurl, createdat, lowstockthreshold, isactive, updatedat) FROM stdin;
17	ashwagandha	1	Pure Ashwagandha (Withania somnifera) root powder. One of the most powerful herbs in Ayurveda, known as Indian Ginseng. Used for over 3000 years to relieve stress, increase energy levels, and improve concentration.	1 teaspoon (3-5g) with warm milk or water, twice daily after meals	Reduces cortisol levels and manages stress, boosts testosterone and fertility in men, increases muscle mass and strength, improves brain function and memory, lowers blood sugar and cholesterol levels	Mix 1 teaspoon of powder in a glass of warm milk with a pinch of black pepper for better absorption. Take once in the morning and once before bed. For best results, use continuously for 2-3 months.	Not recommended during pregnancy or breastfeeding. May interact with thyroid, blood sugar, and blood pressure medications. Consult a doctor if you have autoimmune diseases.	222.00	9	https://res.cloudinary.com/dx4bxilmo/image/upload/v1766936707/med_1766936704371_285.png	2025-12-28 15:45:08.111033	\N	t	2026-03-22 04:25:36.591643
29	Chyawanprash	1	Traditional Ayurvedic immunity booster made with Amla and over 40 herbs. A time-tested formulation for overall health and wellness.	1-2 teaspoons daily with warm milk	Boosts immunity and stamina, rich in Vitamin C, improves digestion, enhances respiratory health, anti-aging benefits	Take 1 teaspoon in the morning with warm milk. Children above 5 years can take half a teaspoon.	Diabetic patients should consult their doctor due to sugar content. Store in a cool, dry place.	380.00	200	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157036472-495808193.jpg	2026-03-22 04:11:20.043164	\N	t	2026-03-22 05:23:59.081024
30	Mahanarayan Oil	4	Traditional Ayurvedic pain relief oil made from a blend of sesame oil and 30+ medicinal herbs. Used for joint pain, muscle stiffness, and arthritis.	Apply externally 2-3 times daily on affected area	Relieves joint and muscle pain, reduces inflammation, improves blood circulation, soothes stiffness and swelling	Warm the oil slightly. Massage gently on affected joints or muscles for 10-15 minutes. Follow with a warm compress for best results.	For external use only. Avoid applying on open wounds or broken skin. Wash hands after application.	320.00	75	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157048755-471406691.jpg	2026-03-22 04:11:20.045002	\N	t	2026-03-22 05:24:11.522246
26	Triphala Powder	6	A classic Ayurvedic formulation combining three powerful fruits: Amla, Bibhitaki, and Haritaki. Used for centuries as a natural digestive cleanser.	1 teaspoon (3-5g) with warm water at bedtime	Promotes healthy digestion, natural detoxification, supports eye health, rich in Vitamin C and antioxidants	Mix 1 teaspoon in a glass of warm water and drink before sleep. Can also be taken with honey.	Avoid during pregnancy and breastfeeding. May cause loose stools initially.	250.00	150	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774156552808-47452241.jpg	2026-03-22 04:11:20.037366	\N	t	2026-03-22 05:15:54.62878
31	Tulsi Drops	5	Concentrated Holy Basil (Tulsi) extract drops. Tulsi is revered in Ayurveda as the "Queen of Herbs" for its powerful healing properties.	2-3 drops in a cup of warm water or tea, twice daily	Boosts respiratory health, natural immunity enhancer, relieves cold and cough, stress adaptogen, anti-bacterial properties	Add 2-3 drops to warm water, tea or honey. Can also be taken directly under the tongue.	Not recommended for pregnant women. Consult doctor if on blood-thinning medications.	180.00	120	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157067879-91701992.jpg	2026-03-22 04:11:20.04686	\N	t	2026-03-22 05:24:29.391251
25	Ashwagandha Capsules	2	Premium Ashwagandha (Withania somnifera) root extract capsules. Known as Indian Ginseng, it is one of the most important herbs in Ayurveda for strength and vitality.	1-2 capsules twice daily with warm milk or water after meals	Reduces stress and anxiety, improves sleep quality, boosts energy and stamina, supports muscle strength, enhances cognitive function	Take with warm milk before bedtime for best results. Continue for at least 3 months for optimal benefits.	Not recommended during pregnancy. Consult a doctor if you have thyroid conditions or are on sedative medications.	450.00	100	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774156537117-596621843.jpg	2026-03-22 04:11:20.033835	\N	t	2026-03-22 05:15:39.933548
27	Brahmi Tablets	3	Pure Brahmi (Bacopa monnieri) extract tablets. A renowned brain tonic in Ayurvedic medicine used to enhance memory and concentration.	2 tablets twice daily after meals	Enhances memory and concentration, reduces mental fatigue, promotes calmness, supports nervous system health	Take consistently for 2-3 months for noticeable cognitive improvement. Best taken after breakfast and dinner.	May cause mild stomach upset in some individuals. Start with a lower dose.	350.00	80	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157000267-104336599.jpg	2026-03-22 04:11:20.039322	\N	t	2026-03-22 05:23:21.900229
23	shilajit	2	Premium grade Shilajit resin sourced from the Himalayan mountains. A powerful mineral-rich substance formed over centuries from plant decomposition. Known as the "Destroyer of Weakness" in Sanskrit.	Pea-sized amount (300-500mg) dissolved in warm milk or water, once or twice daily	Boosts energy and fights chronic fatigue, enhances physical performance and stamina, powerful antioxidant and anti-inflammatory, supports brain health and cognitive function, improves heart health and iron levels	Dissolve a pea-sized portion in warm milk or water. Take on an empty stomach in the morning. Can also be taken before bed with warm milk. Start with a smaller dose and gradually increase.	Buy only purified Shilajit from trusted sources. Do not consume raw or unprocessed Shilajit. Not suitable for children, pregnant or breastfeeding women. Discontinue if you experience dizziness or skin rash.	1000.00	19	uploads/file-1770377191957-321806178.jpg	2026-02-06 11:26:32.190054	10	t	2026-03-22 04:25:36.596153
34	Shatavari Powder	6	Premium quality Shatavari (Asparagus racemosus) root powder. Considered the "Queen of Herbs" in Ayurveda, it is especially beneficial for women's health.	1 teaspoon (3g) twice daily with warm milk or water	Supports hormonal balance in women, improves lactation, anti-aging properties, enhances immunity, soothes digestive system	Mix 1 teaspoon in warm milk with a pinch of cardamom. Best taken morning and evening.	Consult doctor if you have kidney disorders or hormone-sensitive conditions. Not for children under 12.	300.00	110	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157107199-533326349.jpg	2026-03-22 04:11:20.052024	\N	t	2026-03-22 05:25:08.393837
24	Bam (Herbal Balm)	1	Traditional Ayurvedic herbal balm made from camphor, menthol, eucalyptus oil, and natural herbs. Provides quick relief from headaches, body aches, cold, and nasal congestion.	Apply a small amount externally on the affected area 2-3 times daily	Instant relief from headaches and migraines, clears nasal congestion and cold symptoms, soothes muscle pain and joint stiffness, cooling and calming effect, helps with motion sickness and nausea	Gently rub a small amount on the forehead for headache, on the chest for cold, or on sore muscles for pain relief. For nasal congestion, apply under the nostrils and inhale deeply. Wash hands after use.	For external use only. Do not apply on open wounds, broken skin, or near eyes. Keep away from children under 2 years. Stop use if skin irritation develops. Do not ingest.	100.00	9	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774156498185-829011704.jpg	2026-02-09 16:31:29.380061	\N	t	2026-03-22 05:15:00.055424
32	Guduchi (Giloy) Tablets	3	Pure Guduchi (Tinospora cordifolia) stem extract tablets. Known as "Amrita" (the root of immortality) in Ayurveda for its powerful immune-boosting properties.	1-2 tablets twice daily before meals	Powerful immunomodulator, helps manage fever, detoxifies the body, supports liver health, anti-inflammatory	Take on an empty stomach with warm water for best absorption. Use consistently during seasonal changes.	May lower blood sugar levels. Diabetic patients should monitor their levels. Avoid in autoimmune conditions.	280.00	90	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157081294-951406790.jpg	2026-03-22 04:11:20.048707	\N	t	2026-03-22 05:24:42.918245
28	Kumkumadi Tailam (Face Oil)	4	Precious Ayurvedic face oil made with Saffron (Kumkuma) and 16 other herbs. A legendary beauty elixir for radiant, glowing skin.	3-5 drops on face at night	Brightens skin complexion, reduces dark spots and pigmentation, anti-aging properties, nourishes and moisturizes skin	Apply 3-5 drops on clean face at night. Gently massage in upward circular motions. Leave overnight.	Perform a patch test before first use. For external use only. Avoid contact with eyes.	850.00	50	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157009307-963668604.jpg	2026-03-22 04:11:20.041	\N	t	2026-03-22 05:23:31.115975
33	Dashamool Syrup	5	Herbal syrup formulation made from the roots of 10 powerful medicinal plants. A classic Ayurvedic remedy for inflammation and respiratory issues.	10-15ml twice daily after meals	Anti-inflammatory action, relieves body aches, supports respiratory health, reduces Vata dosha imbalance, improves appetite	Shake well before use. Take 10-15ml with equal quantity of warm water after meals.	Store in a cool place. Use within 3 months of opening. Not recommended during pregnancy.	220.00	59	https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/uploads/file-1774157092919-838687682.jpg	2026-03-22 04:11:20.050367	\N	t	2026-03-22 05:24:57.037816
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.order_items (orderitemid, orderid, medicineid, quantity, price) FROM stdin;
1	1	33	1	220.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.orders (orderid, userid, totalamount, shippingaddress, paymentmethod, paymentstatus, orderstatus, createdat) FROM stdin;
1	6	220.00	Hadigau	eSewa	Completed	Approved	2026-03-22 06:55:10.201155
\.


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.reminders (reminderid, userid, medicineid, nextpurchasedate, createdat) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.reviews (reviewid, userid, medicineid, rating, comment, createdat) FROM stdin;
\.


--
-- Data for Name: userhealthinputs; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.userhealthinputs (inputid, userid, bmi, lifestylenotes, createdat) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sanjeevani_user
--

COPY public.users (userid, fullname, email, passwordhash, phone, role, createdat, updatedat, isactive, profileimage) FROM stdin;
6	Lian Gurung	lian@gmail.com	$2b$10$ZwFGbzbi.bhgJJztRjZ5ze4EzIOo0hQ5Gq1r5HUSdcAObrNMnNMRK	9855057168	user	2025-12-20 08:42:04.813844	2025-12-20 08:42:04.813844	t	\N
7	Angel D Bista	angel@gmail.com	$2b$10$ymwg6nT95MS2st6zB/qsxOBmBAV4PdWhHT93oIo/6qOvXT3Mh0liu	9845048169	doctor	2025-12-20 08:42:36.619293	2025-12-20 08:42:36.619293	t	\N
11	Abis shrestha 	abis@gmail.com	$2b$10$eXqnTam7xXH369o/7NcFJ./10aRoFk9dY.Y3eTF5WcWwEkqBDB5by	9864263222	admin	2026-02-06 11:16:42.402277	2026-02-06 11:18:29.204625	t	\N
8	Suyogya Shrestha	suyogya@gmail.com	$2b$10$E0OUB1sxbzdtYTqGFYM.oeyISv3yrzrxhoucghZEp8sMHsnV.uWbm	9898989898	user	2025-12-22 02:04:34.844249	2025-12-22 02:04:34.844249	t	\N
\.


--
-- Name: articles_articleid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.articles_articleid_seq', 1, false);


--
-- Name: categories_categoryid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.categories_categoryid_seq', 12, true);


--
-- Name: consultations_consultationid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.consultations_consultationid_seq', 1, true);


--
-- Name: doctors_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.doctors_id_seq1', 1, false);


--
-- Name: medical_reports_reportid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.medical_reports_reportid_seq', 1, false);


--
-- Name: medicines_medicineid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.medicines_medicineid_seq', 34, true);


--
-- Name: order_items_orderitemid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.order_items_orderitemid_seq', 1, true);


--
-- Name: orders_orderid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.orders_orderid_seq', 1, true);


--
-- Name: reminders_reminderid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.reminders_reminderid_seq', 1, false);


--
-- Name: reviews_reviewid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.reviews_reviewid_seq', 1, false);


--
-- Name: userhealthinputs_inputid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.userhealthinputs_inputid_seq', 1, false);


--
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: sanjeevani_user
--

SELECT pg_catalog.setval('public.users_userid_seq', 12, true);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (articleid);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (categoryid);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (consultationid);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: medical_reports medical_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.medical_reports
    ADD CONSTRAINT medical_reports_pkey PRIMARY KEY (reportid);


--
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (medicineid);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (orderitemid);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (orderid);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (reminderid);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (reviewid);


--
-- Name: reviews reviews_userid_medicineid_key; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_userid_medicineid_key UNIQUE (userid, medicineid);


--
-- Name: userhealthinputs userhealthinputs_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.userhealthinputs
    ADD CONSTRAINT userhealthinputs_pkey PRIMARY KEY (inputid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: articles articles_authorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_authorid_fkey FOREIGN KEY (authorid) REFERENCES public.users(userid) ON DELETE SET NULL;


--
-- Name: consultations consultations_doctorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_doctorid_fkey FOREIGN KEY (doctorid) REFERENCES public.users(userid) ON DELETE SET NULL;


--
-- Name: consultations consultations_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: medical_reports medical_reports_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.medical_reports
    ADD CONSTRAINT medical_reports_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: medicines medicines_categoryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_categoryid_fkey FOREIGN KEY (categoryid) REFERENCES public.categories(categoryid) ON DELETE SET NULL;


--
-- Name: order_items order_items_medicineid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_medicineid_fkey FOREIGN KEY (medicineid) REFERENCES public.medicines(medicineid) ON DELETE SET NULL;


--
-- Name: order_items order_items_orderid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_orderid_fkey FOREIGN KEY (orderid) REFERENCES public.orders(orderid) ON DELETE CASCADE;


--
-- Name: orders orders_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: reminders reminders_medicineid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_medicineid_fkey FOREIGN KEY (medicineid) REFERENCES public.medicines(medicineid) ON DELETE CASCADE;


--
-- Name: reminders reminders_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: reviews reviews_medicineid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_medicineid_fkey FOREIGN KEY (medicineid) REFERENCES public.medicines(medicineid) ON DELETE CASCADE;


--
-- Name: reviews reviews_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: userhealthinputs userhealthinputs_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sanjeevani_user
--

ALTER TABLE ONLY public.userhealthinputs
    ADD CONSTRAINT userhealthinputs_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gWNILChTdeRTNsJg5GOaZXf7G0H0M5JnfVstI5vmXZo0w4pdtwQqbhfsB4vwear

