import { Header } from "@/components/Header";
import { PondStage } from "@/components/PondStage";
import { TECHCONCEPTS_URL } from "@/content/projects/techconcepts";
import "./home.css";

export default function Home() {
  return (
    <div className="page-home">
      <PondStage>
        <Header />
        <main className="hero">
          <h1>Nay Naing</h1>
          <p>Security Engineer / Data Analyst, passionate about building the future for the people.</p>
          <p className="now">Currently working on <a href={TECHCONCEPTS_URL} target="_blank" rel="noopener noreferrer">TechConcepts</a></p>
          <blockquote className="quote">
            <p>“Whenever you find yourself doubting how far you can go, <br />just remember how far you have come. <br />Remember everything you have faced, <br />all the battles you have won, and all the fears you have overcome.”</p>
            <footer>N.R. Walker (2016)</footer>
          </blockquote>
          <div className="links"><a href="https://www.linkedin.com/in/naaay-naing/">linkedin ↗</a><a href="https://github.com/nay244/">github ↗</a></div>
        </main>
      </PondStage>
    </div>
  );
}
