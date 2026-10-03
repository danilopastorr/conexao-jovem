import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function findSubmission(deviceId: string) {
	const { data, error } = await supabaseAdmin()
		.from('retreat_participants')
		.select('name, answers')
		.eq('device_id', deviceId)
		.maybeSingle();

	if (error) throw error;
	return data;
}

export async function GET(req: Request) {
	const deviceId = new URL(req.url).searchParams.get('deviceId') || '';
	if (!uuidPattern.test(deviceId)) {
		return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
	}

	try {
		const submission = await findSubmission(deviceId);
		if (!submission) return NextResponse.json({ alreadySubmitted: false });

		return NextResponse.json({
			alreadySubmitted: true,
			name: submission.name,
			answers: submission.answers,
		});
	} catch (error) {
		console.error('Falha ao verificar participação:', error);
		return NextResponse.json({ error: 'Não foi possível verificar a participação' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const name = typeof body.name === 'string' ? body.name.trim().slice(0, 40) : '';
		const deviceId = typeof body.deviceId === 'string' ? body.deviceId : '';
		const answers = body.answers;

		if (!name || !uuidPattern.test(deviceId) || !Array.isArray(answers) || answers.length !== 7 || answers.some(answer => typeof answer !== 'string')) {
			return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
		}

		const { error } = await supabaseAdmin().from('retreat_participants').insert({
			device_id: deviceId,
			name,
			answers,
			completed: true,
			completed_at: new Date().toISOString(),
		});

		if (error?.code === '23505') {
			const submission = await findSubmission(deviceId);
			if (submission) {
				return NextResponse.json({
					alreadySubmitted: true,
					name: submission.name,
					answers: submission.answers,
				});
			}
		}
		if (error) throw error;

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error('Falha ao salvar participante:', error);
		return NextResponse.json({ error: 'Falha ao salvar' }, { status: 500 });
	}
}
