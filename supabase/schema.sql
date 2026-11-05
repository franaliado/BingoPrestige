-- ==============================================================================
-- BINGO PRESTIGE - DATABASE SCHEMA & RLS POLICIES (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Modalidad: Bingo Americano 75 Bolas (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)
-- Arquitectura: Máxima seguridad del lado del servidor (Zero Client Trust)
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLAS PRINCIPALES
-- ==============================================================================

-- 2.1 PERFILES DE USUARIO (PROFILES)
-- Sincronizado automáticamente con auth.users mediante trigger
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    vip_level INTEGER NOT NULL DEFAULT 1 CHECK (vip_level >= 1 AND vip_level <= 10),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 BILLETERA VIRTUAL (WALLETS)
-- Saldo estrictamente gestionado por funciones seguras (SECURITY DEFINER)
-- Cero bono de bienvenida por requisito de diseño
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    bonus_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (bonus_balance >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 HISTORIAL DE TRANSACCIONES DE BILLETERA
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'card_purchase', 'game_prize', 'refund', 'admin_adjustment')),
    amount NUMERIC(14, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id UUID, -- Puede enlazar al ID de la partida (game_id)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 SALAS Y PARTIDAS DE BINGO (GAMES)
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_code VARCHAR(32) UNIQUE NOT NULL, -- Ej: 'BP-VIP-001'
    room_name VARCHAR(100) NOT NULL DEFAULT 'Salón Royale VIP',
    card_price NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (card_price > 0),
    max_cards_per_user INTEGER NOT NULL DEFAULT 6 CHECK (max_cards_per_user >= 1),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'countdown', 'in_progress', 'completed', 'cancelled')),
    jackpot_amount NUMERIC(14, 2) NOT NULL DEFAULT 500.00,
    line_prize NUMERIC(14, 2) NOT NULL DEFAULT 50.00,
    bingo_prize NUMERIC(14, 2) NOT NULL DEFAULT 200.00,
    drawn_numbers INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    current_ball INTEGER DEFAULT NULL,
    ball_draw_interval_seconds INTEGER NOT NULL DEFAULT 4,
    auto_daub_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    scheduled_start TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 CARTONES Y PARTICIPANTES (GAME_PARTICIPANTS)
-- Cada registro representa 1 cartón comprado por un usuario para una partida específica
CREATE TABLE IF NOT EXISTS public.game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_number INTEGER NOT NULL, -- Número correlativo de cartón del usuario en esta partida (1..max)
    matrix JSONB NOT NULL, -- Matriz 5x5: { "B": [..], "I": [..], "N": [..,"FREE",..], "G": [..], "O": [..] }
    marked_cells JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de números o índices marcados
    has_line BOOLEAN NOT NULL DEFAULT FALSE,
    has_bingo BOOLEAN NOT NULL DEFAULT FALSE,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_game_user_card UNIQUE (game_id, user_id, card_number)
);

-- 2.6 GANADORES DE LA PARTIDA (GAME_WINNERS)
CREATE TABLE IF NOT EXISTS public.game_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_card_id UUID NOT NULL REFERENCES public.game_participants(id) ON DELETE CASCADE,
    prize_type VARCHAR(20) NOT NULL CHECK (prize_type IN ('line', 'bingo', 'jackpot')),
    prize_amount NUMERIC(14, 2) NOT NULL CHECK (prize_amount >= 0),
    winning_ball INTEGER NOT NULL,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. ÍNDICES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_game_participants_game ON public.game_participants(game_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_user ON public.game_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_game_winners_game ON public.game_winners(game_id);

-- ==============================================================================
-- 4. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_winners ENABLE ROW LEVEL SECURITY;

-- 4.1 PROFILES:
-- Lectura pública para poder ver nombres y avatares de participantes en la sala
CREATE POLICY "Profiles son visibles públicamente" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Modificación solo por el propio dueño
CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 4.2 WALLETS:
-- Lectura estricta: Cada usuario ve ÚNICAMENTE su propia billetera
CREATE POLICY "Usuarios solo ven su propia billetera" 
    ON public.wallets FOR SELECT 
    USING (auth.uid() = user_id);

-- IMPORTANTE: No se otorgan políticas de INSERT/UPDATE a usuarios comunes en wallets.
-- Toda mutación de saldo se realiza a través de SECURITY DEFINER functions o Service Role.

-- 4.3 WALLET TRANSACTIONS:
-- Los usuarios solo ven sus propios movimientos financieros
CREATE POLICY "Usuarios solo ven sus propias transacciones" 
    ON public.wallet_transactions FOR SELECT 
    USING (auth.uid() = user_id);

-- 4.4 GAMES:
-- Las partidas activas y públicas son visibles para cualquier usuario autenticado
CREATE POLICY "Partidas visibles para usuarios autenticados" 
    ON public.games FOR SELECT 
    TO authenticated 
    USING (true);

-- 4.5 GAME_PARTICIPANTS (CARTONES):
-- Los usuarios pueden ver sus propios cartones comprados
CREATE POLICY "Usuarios pueden ver sus propios cartones" 
    ON public.game_participants FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- 4.6 GAME_WINNERS:
-- Los ganadores son de conocimiento público para transparencia del juego
CREATE POLICY "Ganadores visibles públicamente" 
    ON public.game_winners FOR SELECT 
    USING (true);

-- ==============================================================================
-- 5. FUNCIONES Y PROCEDIMIENTOS ALMACENADOS (SERVER-SIDE SECURITY)
-- ==============================================================================

-- 5.1 FUNCIÓN PARA GESTIONAR NUEVOS USUARIOS EN AUTH.USERS
-- Crea automáticamente el perfil y la billetera vacía (saldo 0.00, sin bono de bienvenida)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_username TEXT;
BEGIN
    new_username := COALESCE(
        new.raw_user_meta_data->>'username',
        split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
    );

    -- Crear Perfil
    INSERT INTO public.profiles (id, username, full_name, avatar_url, vip_level)
    VALUES (
        new.id,
        new_username,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        1
    );

    -- Crear Billetera con Saldo 0.00 (SIN bono de bienvenida)
    INSERT INTO public.wallets (user_id, balance, bonus_balance, currency)
    VALUES (
        new.id,
        0.00,
        0.00,
        'USD'
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5.2 FUNCIÓN ATÓMICA DE COMPRA DE CARTONES (PREVIENE RACE CONDITIONS Y CLIENT FORGERY)
CREATE OR REPLACE FUNCTION public.purchase_game_cards(
    p_game_id UUID,
    p_cards_matrices JSONB -- Arreglo de matrices [{ "B": [..], "I": [..], ... }]
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_card_count INTEGER;
    v_card_price NUMERIC(10, 2);
    v_total_cost NUMERIC(14, 2);
    v_current_balance NUMERIC(14, 2);
    v_game_status VARCHAR(20);
    v_max_cards INTEGER;
    v_existing_cards INTEGER;
    v_card_elem JSONB;
    v_next_card_num INTEGER;
    v_wallet_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Validar estado del juego
    SELECT status, card_price, max_cards_per_user 
    INTO v_game_status, v_card_price, v_max_cards
    FROM public.games 
    WHERE id = p_game_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Partida no encontrada';
    END IF;

    IF v_game_status NOT IN ('waiting', 'countdown') THEN
        RAISE EXCEPTION 'La partida ya no acepta nuevas compras';
    END IF;

    v_card_count := jsonb_array_length(p_cards_matrices);
    IF v_card_count <= 0 THEN
        RAISE EXCEPTION 'Debe seleccionar al menos un cartón';
    END IF;

    -- Validar límite de cartones
    SELECT COUNT(*) INTO v_existing_cards 
    FROM public.game_participants 
    WHERE game_id = p_game_id AND user_id = v_user_id;

    IF (v_existing_cards + v_card_count) > v_max_cards THEN
        RAISE EXCEPTION 'Límite máximo de cartones superado (% max)', v_max_cards;
    END IF;

    -- Validar saldo de billetera
    v_total_cost := v_card_price * v_card_count;
    SELECT id, balance INTO v_wallet_id, v_current_balance 
    FROM public.wallets 
    WHERE user_id = v_user_id FOR UPDATE;

    IF v_current_balance < v_total_cost THEN
        RAISE EXCEPTION 'Saldo insuficiente en billetera para realizar la compra';
    END IF;

    -- Descontar saldo
    UPDATE public.wallets 
    SET balance = balance - v_total_cost, updated_at = now() 
    WHERE id = v_wallet_id;

    -- Registrar movimiento en historial de transacciones
    INSERT INTO public.wallet_transactions (
        wallet_id, user_id, type, amount, status, description, reference_id
    ) VALUES (
        v_wallet_id, v_user_id, 'card_purchase', -v_total_cost, 'completed',
        format('Compra de %s cartones en Salón Bingo Prestige', v_card_count),
        p_game_id
    );

    -- Insertar cartones
    v_next_card_num := v_existing_cards + 1;
    FOR v_card_elem IN SELECT * FROM jsonb_array_elements(p_cards_matrices)
    LOOP
        INSERT INTO public.game_participants (
            game_id, user_id, card_number, matrix, marked_cells
        ) VALUES (
            p_game_id, v_user_id, v_next_card_num, v_card_elem, '["FREE"]'::jsonb
        );
        v_next_card_num := v_next_card_num + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'cards_purchased', v_card_count,
        'total_spent', v_total_cost,
        'new_balance', v_current_balance - v_total_cost
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.3 FUNCIÓN DE RECARGA DE DEMO / DEPÓSITO SIMULADO (PARA PRUEBAS SEGURA)
CREATE OR REPLACE FUNCTION public.deposit_funds(
    p_amount NUMERIC(14, 2)
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_wallet_id UUID;
    v_new_balance NUMERIC(14, 2);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No autenticado';
    END IF;

    IF p_amount <= 0 OR p_amount > 10000 THEN
        RAISE EXCEPTION 'Monto de depósito inválido';
    END IF;

    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;

    UPDATE public.wallets 
    SET balance = balance + p_amount, updated_at = now()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;

    INSERT INTO public.wallet_transactions (
        wallet_id, user_id, type, amount, status, description
    ) VALUES (
        v_wallet_id, v_user_id, 'deposit', p_amount, 'completed', 'Depósito de fondos a billetera VIP'
    );

    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. PARTIDA DE EJEMPLO INICIAL (DEMO ROOM)
-- ==============================================================================
INSERT INTO public.games (
    game_code,
    room_name,
    card_price,
    max_cards_per_user,
    status,
    jackpot_amount,
    line_prize,
    bingo_prize,
    drawn_numbers,
    current_ball
) VALUES (
    'BP-ROYALE-001',
    'Salón Royale Prestige VIP',
    5.00,
    6,
    'waiting',
    1250.00,
    150.00,
    600.00,
    ARRAY[]::INTEGER[],
    NULL
) ON CONFLICT (game_code) DO NOTHING;

