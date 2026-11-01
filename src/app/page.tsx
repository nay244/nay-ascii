import { Header } from "@/components/Header";
import { PondStage } from "@/components/PondStage";
import "./home.css";

export default function Home() {
  return (
    <div className="page-home">
      <PondStage>
        <Header showName={false} />
        <main className="hero">
          <h1>Nay Naing</h1>
          <p>Security Engineer / Data Analyst, passionate about building the future for the people.</p>
          <blockquote className="quote">
            <p>“Whenever you find yourself doubting how far you can go, just remember how far you have come. Remember everything you have faced, all the battles you have won, and all the fears you have overcome.”</p>
            <footer><a href="https://www.goodreads.com/en/book/show/31997446">N.R. Walker ↗</a> (2016)</footer>
          </blockquote>
          <div className="links"><a href="https://www.linkedin.com/in/naaay-naing/">linkedin ↗</a><a href="https://github.com/nay244/">github ↗</a></div>
        </main>
      </PondStage>
    </div>
  );
}
