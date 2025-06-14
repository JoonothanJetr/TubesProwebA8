PGDMP  4    3    
            }            catering_ecommerce    17.4    17.4 S    j           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            k           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            l           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            m           1262    18418    catering_ecommerce    DATABASE     x   CREATE DATABASE catering_ecommerce WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en-US';
 "   DROP DATABASE catering_ecommerce;
                     postgres    false                        2615    18569    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     postgres    false            n           0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        postgres    false    5            o           0    0    SCHEMA public    ACL     Q   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
                        postgres    false    5            �            1255    18736    update_feedback_timestamp()    FUNCTION     �   CREATE FUNCTION public.update_feedback_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
                BEGIN
                    NEW.updated_at = NOW();
                    RETURN NEW;
                END;
                $$;
 2   DROP FUNCTION public.update_feedback_timestamp();
       public               postgres    false    5            �            1259    18611    cart    TABLE     J  CREATE TABLE public.cart (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_quantity_check CHECK ((quantity > 0))
);
    DROP TABLE public.cart;
       public         heap r       postgres    false    5            �            1259    18610    cart_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.cart_id_seq;
       public               postgres    false    224    5            p           0    0    cart_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;
          public               postgres    false    223            �            1259    18583 
   categories    TABLE     �   CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.categories;
       public         heap r       postgres    false    5            �            1259    18582    categories_id_seq    SEQUENCE     �   CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.categories_id_seq;
       public               postgres    false    220    5            q           0    0    categories_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
          public               postgres    false    219            �            1259    18755    customer_feedback    TABLE     E  CREATE TABLE public.customer_feedback (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    message text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_feedback_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'resolved'::character varying])::text[])))
);
 %   DROP TABLE public.customer_feedback;
       public         heap r       postgres    false    5            �            1259    18754    customer_feedback_id_seq    SEQUENCE     �   CREATE SEQUENCE public.customer_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.customer_feedback_id_seq;
       public               postgres    false    232    5            r           0    0    customer_feedback_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.customer_feedback_id_seq OWNED BY public.customer_feedback.id;
          public               postgres    false    231            �            1259    18654    order_items    TABLE     z  CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);
    DROP TABLE public.order_items;
       public         heap r       postgres    false    5            �            1259    18653    order_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.order_items_id_seq;
       public               postgres    false    228    5            s           0    0    order_items_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;
          public               postgres    false    227            �            1259    18634    orders    TABLE     �  CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    total_amount numeric(10,2) NOT NULL,
    order_status character varying(50) DEFAULT 'diproses'::character varying NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_status character varying(50) DEFAULT 'menunggu pembayaran'::character varying NOT NULL,
    delivery_address text,
    phone_number character varying(20),
    desired_completion_date date,
    payment_proof_url character varying(255),
    admin_comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delivery_option character varying(20) DEFAULT 'pickup'::character varying,
    CONSTRAINT orders_order_status_check CHECK (((order_status)::text = ANY ((ARRAY['diproses'::character varying, 'dibatalkan'::character varying, 'selesai'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['menunggu pembayaran'::character varying, 'pembayaran sudah dilakukan'::character varying, 'pembayaran dibatalkan'::character varying])::text[])))
);
    DROP TABLE public.orders;
       public         heap r       postgres    false    5            �            1259    18633    orders_id_seq    SEQUENCE     �   CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.orders_id_seq;
       public               postgres    false    226    5            t           0    0    orders_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;
          public               postgres    false    225            �            1259    18594    products    TABLE     �  CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 100 NOT NULL,
    image_url text,
    category_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);
    DROP TABLE public.products;
       public         heap r       postgres    false    5            �            1259    18593    products_id_seq    SEQUENCE     �   CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.products_id_seq;
       public               postgres    false    222    5            u           0    0    products_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
          public               postgres    false    221            �            1259    18674    reviews    TABLE     p  CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
    DROP TABLE public.reviews;
       public         heap r       postgres    false    5            �            1259    18673    reviews_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.reviews_id_seq;
       public               postgres    false    5    230            v           0    0    reviews_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
          public               postgres    false    229            �            1259    18571    users    TABLE     �  CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'customer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.users;
       public         heap r       postgres    false    5            �            1259    18570    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218    5            w           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217            �           2604    18614    cart id    DEFAULT     b   ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);
 6   ALTER TABLE public.cart ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    223    224                       2604    18586    categories id    DEFAULT     n   ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
 <   ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            �           2604    18758    customer_feedback id    DEFAULT     |   ALTER TABLE ONLY public.customer_feedback ALTER COLUMN id SET DEFAULT nextval('public.customer_feedback_id_seq'::regclass);
 C   ALTER TABLE public.customer_feedback ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    231    232            �           2604    18657    order_items id    DEFAULT     p   ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);
 =   ALTER TABLE public.order_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    18637 	   orders id    DEFAULT     f   ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);
 8   ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225    226            �           2604    18597    products id    DEFAULT     j   ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);
 :   ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            �           2604    18677 
   reviews id    DEFAULT     h   ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);
 9   ALTER TABLE public.reviews ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    229    230            {           2604    18574    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            _          0    18611    cart 
   TABLE DATA           Y   COPY public.cart (id, user_id, product_id, quantity, created_at, updated_at) FROM stdin;
    public               postgres    false    224   �i       [          0    18583 
   categories 
   TABLE DATA           F   COPY public.categories (id, name, created_at, updated_at) FROM stdin;
    public               postgres    false    220   �i       g          0    18755    customer_feedback 
   TABLE DATA           e   COPY public.customer_feedback (id, name, email, message, status, created_at, updated_at) FROM stdin;
    public               postgres    false    232   �j       c          0    18654    order_items 
   TABLE DATA           h   COPY public.order_items (id, order_id, product_id, quantity, price, created_at, updated_at) FROM stdin;
    public               postgres    false    228   .k       a          0    18634    orders 
   TABLE DATA           �   COPY public.orders (id, user_id, total_amount, order_status, payment_method, payment_status, delivery_address, phone_number, desired_completion_date, payment_proof_url, admin_comment, created_at, updated_at, delivery_option) FROM stdin;
    public               postgres    false    226   �l       ]          0    18594    products 
   TABLE DATA           �   COPY public.products (id, name, description, price, stock, image_url, category_id, created_at, updated_at, is_deleted) FROM stdin;
    public               postgres    false    222   �o       e          0    18674    reviews 
   TABLE DATA           c   COPY public.reviews (id, user_id, product_id, rating, comment, created_at, updated_at) FROM stdin;
    public               postgres    false    230   �q       Y          0    18571    users 
   TABLE DATA           \   COPY public.users (id, username, email, password, role, created_at, updated_at) FROM stdin;
    public               postgres    false    218   �q       x           0    0    cart_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.cart_id_seq', 24, true);
          public               postgres    false    223            y           0    0    categories_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.categories_id_seq', 8, true);
          public               postgres    false    219            z           0    0    customer_feedback_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.customer_feedback_id_seq', 4, true);
          public               postgres    false    231            {           0    0    order_items_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.order_items_id_seq', 26, true);
          public               postgres    false    227            |           0    0    orders_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.orders_id_seq', 24, true);
          public               postgres    false    225            }           0    0    products_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.products_id_seq', 8, true);
          public               postgres    false    221            ~           0    0    reviews_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);
          public               postgres    false    229                       0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 7, true);
          public               postgres    false    217            �           2606    18620    cart cart_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_pkey;
       public                 postgres    false    224            �           2606    18622     cart cart_user_id_product_id_key 
   CONSTRAINT     j   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_product_id_key UNIQUE (user_id, product_id);
 J   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_user_id_product_id_key;
       public                 postgres    false    224    224            �           2606    18592    categories categories_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);
 H   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_key;
       public                 postgres    false    220            �           2606    18590    categories categories_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
       public                 postgres    false    220            �           2606    18766 (   customer_feedback customer_feedback_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.customer_feedback
    ADD CONSTRAINT customer_feedback_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.customer_feedback DROP CONSTRAINT customer_feedback_pkey;
       public                 postgres    false    232            �           2606    18662    order_items order_items_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_pkey;
       public                 postgres    false    228            �           2606    18647    orders orders_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_pkey;
       public                 postgres    false    226            �           2606    18604    products products_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public                 postgres    false    222            �           2606    18684    reviews reviews_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
       public                 postgres    false    230            �           2606    18581    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            �           2606    18579    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           1259    18714    idx_cart_user    INDEX     A   CREATE INDEX idx_cart_user ON public.cart USING btree (user_id);
 !   DROP INDEX public.idx_cart_user;
       public                 postgres    false    224            �           1259    18767    idx_feedback_email    INDEX     Q   CREATE INDEX idx_feedback_email ON public.customer_feedback USING btree (email);
 &   DROP INDEX public.idx_feedback_email;
       public                 postgres    false    232            �           1259    18768    idx_feedback_status    INDEX     S   CREATE INDEX idx_feedback_status ON public.customer_feedback USING btree (status);
 '   DROP INDEX public.idx_feedback_status;
       public                 postgres    false    232            �           1259    18716    idx_order_items_order    INDEX     Q   CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);
 )   DROP INDEX public.idx_order_items_order;
       public                 postgres    false    228            �           1259    18715    idx_orders_user    INDEX     E   CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);
 #   DROP INDEX public.idx_orders_user;
       public                 postgres    false    226            �           1259    18713    idx_products_category    INDEX     Q   CREATE INDEX idx_products_category ON public.products USING btree (category_id);
 )   DROP INDEX public.idx_products_category;
       public                 postgres    false    222            �           1259    18717    idx_reviews_product    INDEX     M   CREATE INDEX idx_reviews_product ON public.reviews USING btree (product_id);
 '   DROP INDEX public.idx_reviews_product;
       public                 postgres    false    230            �           2620    18769 +   customer_feedback update_feedback_timestamp    TRIGGER     �   CREATE TRIGGER update_feedback_timestamp BEFORE UPDATE ON public.customer_feedback FOR EACH ROW EXECUTE FUNCTION public.update_feedback_timestamp();
 D   DROP TRIGGER update_feedback_timestamp ON public.customer_feedback;
       public               postgres    false    233    232            �           2606    18628    cart cart_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
 C   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_product_id_fkey;
       public               postgres    false    224    4779    222            �           2606    18623    cart cart_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 @   ALTER TABLE ONLY public.cart DROP CONSTRAINT cart_user_id_fkey;
       public               postgres    false    224    218    4772            �           2606    18663 %   order_items order_items_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_order_id_fkey;
       public               postgres    false    228    4787    226            �           2606    18668 '   order_items order_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;
 Q   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_product_id_fkey;
       public               postgres    false    4779    228    222            �           2606    18648    orders orders_user_id_fkey    FK CONSTRAINT     y   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 D   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_user_id_fkey;
       public               postgres    false    226    218    4772            �           2606    18605 "   products products_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
 L   ALTER TABLE ONLY public.products DROP CONSTRAINT products_category_id_fkey;
       public               postgres    false    4776    220    222            �           2606    18690    reviews reviews_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 I   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_product_id_fkey;
       public               postgres    false    4779    230    222            �           2606    18685    reviews reviews_user_id_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 F   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_user_id_fkey;
       public               postgres    false    230    4772    218            _      x������ � �      [   �   x�}�1� ������``��Rխ��*	CK�߭]��?�`6ݵi����Z),kX�[���wB	O�ٞ�sjD�2c�yB �{���GGI��?�d.����G}�C�(�S����DyB�p ���9�      g   �   x��ͱ�0�����д�G����	��.�����>�l���K���P�n�Sb�7�����I#�gf����f�iX���
S��{C�hYYr��,j��y夲D�R���x��A���u��)��
[b�3�9�JV%9g�M
!>K1=A      c   V  x���˭�0C�Vi��>��Z^�u�|W�Ib�b6�P8�h:hh�Ff��MX���G��\���s`�8H$M�S$�c��X�p9Hn���"�مX���!�#��h��!�I"�y�w����쳞ݖ�F���bgt����R�d����wߜm��w��A�i�ͶM=�/��\6��d�D�V��e<eTW�5��a�� �����x�\��r�H���zX����;��3����6?�=���:z�HM��D���rm���)b�
$�C� ��m�3I=2y��,�]'�3_%�j��@U�jJ���8H�U{icM�"�/�Gz�A��ND e_��      a     x���͎�V���)x[�{���,f�'��g@��Ф�ۧ.3{��B�:H�|Ω�&l�!��Ym��O���Y����>���yy\�2��á�4��t��G�P�(����-E�&�QC<Zer2ꎇM����?}	���Bļ�f�j����~~Y��n����,o޲����T ]�SZct�E�z�Nـx^
i�ۯ��qQ!��ޯOö���jn`��y5��\m����:��֫ۥTK�{�Q��A�tXA���hZ��P���[� ���^)�R����KA~Ŕ�[�������\@G�����N�6�T� ��	,s�ԃ�,����n"�tf"�+VC��!�GΙd/$v�qB	T ��g�������.zJ�A;6����S�+im��I98�'�NĈ�mZ
�J6!E�)��A�)i�T��4A��7*����8��|a�~xx��֬�䣔��'���o��ц�������e$�Y�X��m��A�A�>�֕�r\����e�C�c�J2&KV�2"��	zt��(���¼����B%$�h�K�Sԙ. :/f�nI\�)}୩����"9�<�}\��ku*s�I7*�M�������6�\	�b#Q� o3x��X�y���蝻jЬ���7\�&2���+�`�5�mH�vYY���r9��61{��"����4�1�������Uܳ���f1Prj&�VOHJ#K���g��&�ѫ���|��מ�ǳ�C,Jv��5������r�W�m^�RF��s�X,��jr      ]   �  x��SK��0>;��?`�c���{����6�6m7�����t)+��(�x^�癱g�1����%������O�>77j��ZJ����҇�Vk��3�:r8.C�QX;�C{ϴ�p���{v,R�H���̸�X�H�rWQ|�_�{z��� ��8O��P6j�^��.�%��n�#���G���[:=�ˡ[p��q<�!�P�F7 ���������=ӺR�������w�0�6�n�sI����:��[R��L�M왾�S�$*pZ[%���ũ?�n䌷�Q���(E����i]9Y�ml3]ނ[֗
Y� �#a��b��Rːt����ךP��P����ze��n�5u�#_��i{��9�1�z�SA^f��<;V�SR��K\��:��e��C��7��<��4�3�|�����%m߈l����>����~9�o�(���*se����Mp �\�1\��7N�S]U�o�}      e      x������ � �      Y   �  x�}�Ko�0F�ɯȂmۉ�Z�J�HR��lq��p�����C5�V�f��͑��·$\��}v��[���,��={���c7��+��A�ѐ°���˪�-l�ʗp��~{򌤊C����)��<@򀱂�Cl! �a��$kҌ�u���U$���n�����ho3@���_f�J��t���eh����!��ye�q1��� �}��=��q�.:��5mY��KDS�͂8XPC�n�A2�fe"���M�H߅���[��|_���5��ǚI�i�L	�^��ӳʷ��� ˈO��w�?���,`a���i�޿�������"�_��r�،��qw��\������j�^�������S��'���%
2��F���;H6��g��a�`�Rs�X��Lgr*��M/ּŨ��I�4{��]��KwK~=���̋V��j����AB`"���$��,����P     