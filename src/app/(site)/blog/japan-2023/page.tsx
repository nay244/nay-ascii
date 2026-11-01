import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Art } from "@/components/Art";
import { Facts } from "@/components/Facts";
import { RouteLog } from "@/components/RouteLog";
import { POSTS } from "@/content/blog";
import { DAYS, SPEND } from "@/content/japan-2023";
import "./post.css";

// The post's tag, dates, title and summary are the blog front page's card, so the two can't drift apart.
const post = POSTS[0];

export const metadata: Metadata = { title: post.title };

// The post's own headline numbers, label first.
const FACTS: [string, string][] = [["days", "15"], ["total spent", "~$2,750"], ["avg. spent per day", "~$68"], ["konbinis visited", "31"]];

export default function Japan2023() {
  return (
    <div className="page-post">
      <Link className="back" href="/blog">← blog</Link>
      <section className="hero">
        <div>
          <div className="meta">
            <span className="kind personal">{post.tag}</span>
            <span className="dates">{post.when}</span>
          </div>
          <h1 className="p-title">{post.title}</h1>
          <p className="p-sum">{post.sum}</p>
        </div>
        <Art piece="fuji-dawn-lake" className="art" />
      </section>
      <Facts items={FACTS} />

      <h3 className="sec">travel log</h3>
      <RouteLog days={DAYS} />

      <h3 className="sec">expenses</h3>
      <div className="spend">
        <table className="bars">
          <caption>Share of the total spent</caption>
          <tbody>
            {SPEND.map(([name, pct]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>
                  <span className="tip">
                    <span className="bar" style={{ "--p": pct } as CSSProperties} />
                    <span className="val">{`${pct}%`}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="extras">
          <div><dt>biggest expense (flight)</dt><dd>$1,250</dd></div>
          <div><dt>transportation</dt><dd>~$290.80</dd></div>
          <div><dt>konbinis visited</dt><dd>31<span>¥12,122 spent</span></dd></div>
          <div><dt>vending machines used</dt><dd>8<span>¥1,212 spent</span></dd></div>
        </dl>
      </div>

      <nav className="pager" aria-label="More of the blog">
        <Link href="/blog">← blog</Link>
      </nav>
    </div>
  );
}
