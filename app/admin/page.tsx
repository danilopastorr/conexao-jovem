'use client';

import { useEffect, useState } from 'react';
import { questions } from '@/lib/retreat-questions';

type Participant = {
	id: string;
	name: string;
	created_at: string;
	completed: boolean;
	completed_at: string | null;
	answers: string[] | null;
};

export default function Admin() {
	const [password, setPassword] = useState('');
	const [data, setData] = useState<Participant[] | null>(null);
	const [error, setError] = useState('');
	const [checkingSession, setCheckingSession] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function restoreSession() {
			try {
				const response = await fetch('/api/admin/data');
				if (response.ok) {
					const participants: Participant[] = await response.json();
					if (!cancelled) setData(participants);
				} else if (response.status !== 401 && !cancelled) {
					setError('Não foi possível verificar a sessão');
				}
			} catch {
				if (!cancelled) setError('Não foi possível verificar a sessão');
			} finally {
				if (!cancelled) setCheckingSession(false);
			}
		}

		void restoreSession();
		return () => { cancelled = true; };
	}, []);

	async function login() {
		setError('');
		const response = await fetch('/api/admin/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password }),
		});
		if (!response.ok) {
			setError('Senha inválida');
			return;
		}

		const dataResponse = await fetch('/api/admin/data');
		if (dataResponse.ok) setData(await dataResponse.json());
		else setError('Não autorizado');
	}

	if (checkingSession) {
		return <main className="admin"><div className="hero" style={{ minHeight: '80vh' }}>
			<div className="kicker">Painel do retiro</div>
			<p>Verificando sessão...</p>
		</div></main>;
	}

	if (!data) {
		return <main className="admin"><div className="hero" style={{ minHeight: '80vh' }}>
			<div className="kicker">Painel do retiro</div>
			<h2>Consultar <em>participantes.</em></h2>
			<input className="input" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Senha administrativa" />
			<button className="btn" onClick={login}>ENTRAR</button>
			{error && <p>{error}</p>}
		</div></main>;
	}

	const completedCount = data.filter(participant => participant.completed).length;
	const latestSubmission = data[0] ? new Date(data[0].created_at).toLocaleDateString('pt-BR') : '—';

	return <main className="admin">
		<div className="admin-screen">
			<div className="admin-toolbar">
				<div>
					<div className="kicker">Painel — Conexão Jovem</div>
					<h1 style={{ fontSize: '56px' }}>Participantes.</h1>
				</div>
				<button className="btn" onClick={() => window.print()}>BAIXAR PDF</button>
			</div>
			<div className="statgrid">
				<div className="stat"><div className="small">PARTICIPANTES</div><b>{data.length}</b></div>
				<div className="stat"><div className="small">CONCLUÍRAM</div><b>{completedCount}</b></div>
				<div className="stat"><div className="small">ÚLTIMO ENVIO</div><b>{latestSubmission}</b></div>
			</div>
			<div className="tablewrap"><table className="table">
				<thead><tr><th>Nome</th><th>Data</th>{questions.map(question => <th key={question.title}>{question.title}</th>)}</tr></thead>
				<tbody>{data.map(participant => <tr key={participant.id}>
					<td>{participant.name}</td>
					<td>{new Date(participant.created_at).toLocaleString('pt-BR')}</td>
					{questions.map((question, index) => <td key={question.title}>{participant.answers?.[index] || '—'}</td>)}
				</tr>)}</tbody>
			</table></div>
		</div>

		<section className="admin-print-report" aria-label="Relatório de respostas">
			<header className="print-header">
				<p>CONEXÃO JOVEM · NA MESA</p>
				<h1>Respostas dos participantes</h1>
				<div>{data.length} participantes · {completedCount} concluíram · Gerado em {new Date().toLocaleDateString('pt-BR')}</div>
			</header>
			{data.map((participant, participantIndex) => <article className="print-participant" key={participant.id}>
				<div className="print-participant-heading">
					<h2>{participantIndex + 1}. {participant.name}</h2>
					<p>{new Date(participant.created_at).toLocaleString('pt-BR')} · {participant.completed ? 'Concluído' : 'Incompleto'}</p>
				</div>
				{questions.map((question, index) => <div className="print-answer" key={question.title}>
					<h3>Fase {index + 1} · {question.title}</h3>
					<p className="print-prompt">{question.prompt}</p>
					<p>{participant.answers?.[index] || 'Sem resposta'}</p>
				</div>)}
			</article>)}
		</section>
	</main>;
}
