import styles from "./page.module.css";
import Board from "@/app/board";

export default function Home() {
  return (
    <main className={styles.main}>
      <Board />
    </main>
  );
}
