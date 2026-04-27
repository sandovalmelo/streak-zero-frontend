import { useEffect, useState, useRef } from "react";
import { Check, Trash2, Flame, Plus } from "lucide-react";
import "./App.css";
import SkeletonHabit from "./components/SkeletonHabit";
import { API_URL } from "./config/api";

function App() {
	const [habits, setHabits] = useState([]);
	const [name, setName] = useState("");
	const [loading, setLoadaing] = useState(true);
	const [toast, setToast] = useState(null);
	const inputRef = useRef(null);

	const sortedHabits = [...habits].sort((a, b) => b.steak - a.streak);

	const fetchHabits = async () => {
		setLoadaing(true);

		const res = await fetch(`${API_URL}/habits`);
		const data = await res.json();

		setHabits(data);
		setLoadaing(false);
	};

	const createHabit = async () => {
		if (!name) return;

		await fetch(`${API_URL}/habits`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ name })
		});

		setName("");
		fetchHabits();

		setToast({ type: "success", text: "Hábito criado!" });
		setTimeout(() => setToast(null), 2000);

		inputRef.current.focus();
	};

	const completeHabit = async (id) => {
		await fetch(`${API_URL}/habits/${id}/complete`, {
			method: "PATCH"
		});

		fetchHabits();
		setToast({ type: "success", text: "Hábito concluído!" });
		setTimeout(() => setToast(null), 2000);
	};

	const deleteHabit = async (id) => {
		await fetch(`${API_URL}/habits/${id}`, {
			method: "DELETE"
		});

		fetchHabits();

		setToast({ type: "success", text: "Hábito removido!" });
		setTimeout(() => setToast(null), 2000);
	};

	useEffect(() => {
		fetchHabits();
	}, []);

	if (loading) {
		return (
			<div className="container">
				<h1>🔥 Habit Tracker</h1>

				{[1, 2, 3].map((i) => (
					<SkeletonHabit key={i} />
				))}
			</div>
		);
	}

	return (
		<div className="container">
			<h1>🔥 Habit Tracker</h1>
			<p className="subtitle">Construa consistência todos os dias</p>

			<div className="form">
				<input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createHabit()} placeholder="Ex: Estudar 30min" />
				<button className="btn-create" onClick={createHabit}>
					<Plus size={16} />
					Criar
				</button>
			</div>

			{toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}

			{habits.length === 0 && (
				<div className="empty">
					<p>Nenhum hábito ainda</p>
					<span>Comece criando um acime 👆</span>
				</div>
			)}

			{sortedHabits.map((habit) => {
				const today = new Date().toISOString().split("T")[0];

				let isDoneToday;

				if (habit.lastCompletedDate) {
					isDoneToday = habit.lastCompletedDate.split("T")[0] === today;
				}

				return (
					<div key={habit.id} className={`habit ${isDoneToday ? "done" : ""}`}>
						<div>
							<div className="habit-name">{habit.name}</div>
							<div className="habit-streak">
								<Flame size={16} /> {habit.streak} {habit.streak === 1 ? "dia" : "dias"}
							</div>
						</div>

						<div>
							<button onClick={() => completeHabit(habit.id)} disabled={isDoneToday} className={isDoneToday ? "btn-disabled" : "btn-complete"}>
								{isDoneToday ? "Feito" : <Check size={16} />}
							</button>
							<button onClick={() => deleteHabit(habit.id)} className="btn-delete">
								<Trash2 size={16} />
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default App;
