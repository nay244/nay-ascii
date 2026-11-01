import type { Metadata } from "next";
import Link from "next/link";
import { Art } from "@/components/Art";
import { Facts } from "@/components/Facts";
import { POSTS, SERIES } from "@/content/blog";
import "./blog.css";

export const metadata: Metadata = { title: "Blog" };

export default function Blog() {
  return (
    <div className="page-blog">
      <h1 className="page-title">blog</h1>
      <p className="page-lede">Less techy, more fun. Writing on learning, travel and life, plus the notes I keep while studying.</p>
      <h3 className="sec">latest post</h3>
      {POSTS.map((p) => (
        <Link className="card feature" href={p.href} key={p.href}>
          <Art piece={p.piece} className="art" />
          {/* A <div>, because the facts are a list and can't sit in a <span>. */}
          <div className="body">
            <span className="top-line">
              <span className="kind personal">{p.tag}</span>
              <span className="dates">{p.when}</span>
            </span>
            <span className="title">{p.title}</span>
            <span className="sum">{p.sum}</span>
            {/* The post's facts are written number first, label second; Facts takes the label first and the stylesheet puts the number on top. */}
            <Facts items={p.facts.map(([number, label]): [string, string] => [label, number])} />
            <span className="more">read the post →</span>
          </div>
        </Link>
      ))}
      <h3 className="sec">notes</h3>
      <ul className="series">
        {SERIES.map((s) => (
          <li key={s.id}>
            <Link className="card" href={`/blog/${s.id}`}>
              <Art piece={s.piece} className="art" />
              <span className="body">
                <span className="top-line">
                  <span className="title">{s.title}</span>
                  <span className="count">{s.notes.length} notes</span>
                </span>
                <span className="sum">{s.sum}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
