'use client';

import { useEffect, useState } from 'react';
import { questions } from '@/lib/retreat-questions';

type Submission = { name: string; answers: string[] };

const deviceStorageKey = 'conexao-jovem-device-id';

function getDeviceId() {
	const existingId = window.localStorage.getItem(deviceStorageKey);
	if (existingId) return existingId;

	const newId = window.crypto.randomUUID();
	window.localStorage.setItem(deviceStorageKey, newId);
	return newId;
}

export default function Home() {
	const [name, setName] = useState('');
	const [phase, setPhase] = useState(-1);
	const [answer, setAnswer] = useState('');
	const [answers, setAnswers] = useState<string[]>([]);
	const [selected, setSelected] = useState('');
	const [sending, setSending] = useState(false);
	const [done, setDone] = useState(false);
	const [deviceId, setDeviceId] = useState('');
	const [checkingDevice, setCheckingDevice] = useState(true);
	const [checkFailed, setCheckFailed] = useState(false);
	const [previousSubmission, setPreviousSubmission] = useState<Submission | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function checkPreviousSubmission() {
			try {
				const id = getDeviceId();
				const response = await fetch(`/api/submit?deviceId=${encodeURIComponent(id)}`);
				if (!response.ok) throw new Error('Não foi possível verificar a participação');

				const result = await response.json();
				if (cancelled) return;

				setDeviceId(id);
				if (result.alreadySubmitted) {
					setPreviousSubmission({ name: result.name, answers: result.answers });
				}
			} catch {
				if (!cancelled) setCheckFailed(true);
			} finally {
				if (!cancelled) setCheckingDevice(false);
			}
		}

		void checkPreviousSubmission();
		return () => { cancelled = true; };
	}, []);

	async function next() {
		if (phase === -1) {
			if (!name.trim()) return;
			setPhase(0);
			return;
		}

		const currentAnswer = (selected || answer).trim();
		if (!currentAnswer) return;

		const nextAnswers = [...answers];
		nextAnswers[phase] = currentAnswer;
		setAnswers(nextAnswers);
		setSelected('');
		setAnswer('');

		if (phase < questions.length - 1) {
			setPhase(phase + 1);
			return;
		}

		setSending(true);
		try {
			const response = await fetch('/api/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name.trim(), answers: nextAnswers, deviceId }),
			});
			const result = await response.json();

			if (result.alreadySubmitted) {
				setPreviousSubmission({ name: result.name, answers: result.answers });
				return;
			}
			if (!response.ok) throw new Error(result.error || 'Falha ao salvar');
			setDone(true);
		} catch {
			alert('Não foi possível salvar agora. Tente novamente.');
		} finally {
			setSending(false);
		}
	}

	if (checkingDevice) {
		return <main className="app"><div className="hero"><div className="kicker">Conexão Jovem</div><p>Verificando sua participação...</p></div></main>;
	}

	if (checkFailed) {
		return <main className="app"><div className="hero"><div className="kicker">Não foi possível verificar</div><h2>Tente novamente.</h2><p>Não conseguimos confirmar se este dispositivo já participou. Recarregue a página para tentar de novo.</p><button className="btn" onClick={() => window.location.reload()}>RECARREGAR</button></div></main>;
	}

	if (previousSubmission) {
		return <main className="app">
			<div className="top"><div className="brand">CONEXÃO <span>JOVEM</span></div><div className="badge">NA MESA</div></div>
			<div className="hero" style={{ minHeight: 'auto' }}>
				<div className="kicker">Participação registrada</div>
				<h2>Você já respondeu <em>neste dispositivo.</em></h2>
				<p>{previousSubmission.name}, estas foram as respostas enviadas:</p>
				<div className="card">
					{questions.map((question, index) => <div className="question" key={question.title}>
						<strong>{question.title}</strong>
						<p>{question.prompt}</p>
						<p>{previousSubmission.answers[index] || 'Sem resposta'}</p>
					</div>)}
				</div>
			</div>
		</main>;
	}

	if (done) {
		return <main className="app"><div className="hero"><div className="kicker">Você chegou até aqui.</div><h2>A mesa está <em>pronta.</em></h2><p>{name}, suas respostas foram registradas. Agora é hora de sair da tela e viver o que vem pela frente.</p><div className="card"><div className="kicker">ÚLTIMA MISSÃO</div><strong>Antes de dormir, faça uma oração.</strong><p>Pergunte a Deus: “O que o Senhor quer fazer em mim nesses dias?”</p></div></div></main>;
	}

	return <main className="app">
		<div className="top"><div className="brand">CONEXÃO <span>JOVEM</span></div><div className="badge">NA MESA</div></div>
		{phase === -1 ? <div className="hero">
			<div className="kicker">Uma experiência em 7 fases</div>
			<h1>O caminho<br />até a <em>MESA.</em></h1>
			<p>Complete tudo de uma vez. Suas respostas ficam registradas para a organização do retiro.</p>
			<input className="input" value={name} onChange={event => setName(event.target.value)} maxLength={40} placeholder="Digite seu nome" />
			<button className="btn" onClick={next}>COMEÇAR</button>
		</div> : <>
			<div className="meta"><span>FASE {phase + 1} DE 7</span><span>{name}</span></div>
			<div className="progress"><i style={{ width: `${phase / questions.length * 100}%` }} /></div>
			<div className="kicker">FASE {String(phase + 1).padStart(2, '0')} — {questions[phase].title}</div>
			<h2>{questions[phase].title}</h2>
			<p>{questions[phase].prompt}</p>
			<div className="card">
				{questions[phase].type === 'text' ? <input className="input" value={answer} onChange={event => setAnswer(event.target.value)} maxLength={200} placeholder={questions[phase].placeholder} /> : <div className="options">
					{questions[phase].options.map(option => <button key={option} className={`option ${selected === option ? 'selected' : ''}`} onClick={() => setSelected(option)}>{option}</button>)}
				</div>}
				<button className="btn" style={{ marginTop: 14 }} onClick={next} disabled={sending}>{sending ? 'SALVANDO...' : phase === questions.length - 1 ? 'FINALIZAR' : 'PRÓXIMA FASE'}</button>
			</div>
		</>}
	</main>;
}
