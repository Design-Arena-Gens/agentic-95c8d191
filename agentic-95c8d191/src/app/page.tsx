"use client";

import useSWR from "swr";
import styles from "./page.module.css";
import type { MarketSnapshot, Strategy, StrategyPick } from "@/lib/analyzer";

const fetcher = async (input: string): Promise<MarketSnapshot> => {
  const res = await fetch(input);
  if (!res.ok) {
    throw new Error("Failed to load market snapshot");
  }
  return res.json();
};

const STRATEGY_META: Record<
  Strategy,
  { title: string; description: string; color: string }
> = {
  intraday: {
    title: "Intraday Momentum",
    description:
      "High-liquidity names with strong price/volume action for same-day trades.",
    color: "var(--intraday)",
  },
  swing: {
    title: "Swing Trend",
    description:
      "Technically strong setups carrying momentum over days to weeks.",
    color: "var(--swing)",
  },
  options: {
    title: "Options Volatility",
    description:
      "Underlyings with rich implied volatility and directional catalysts.",
    color: "var(--options)",
  },
};

function StrategyCard({ pick }: { pick: StrategyPick }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3>{pick.name}</h3>
          <p className={styles.symbol}>{pick.symbol}</p>
        </div>
        {pick.price !== null && (
          <span className={styles.price}>Rs {pick.price.toFixed(2)}</span>
        )}
      </div>
      <div className={styles.metrics}>
        {pick.metrics.map((metric) => (
          <div key={metric.label} className={styles.metric}>
            <span className={styles.metricLabel}>{metric.label}</span>
            <span className={styles.metricValue}>{metric.value}</span>
          </div>
        ))}
      </div>
      {pick.rationale.length > 0 && (
        <ul className={styles.rationale}>
          {pick.rationale.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StrategySection({
  strategy,
  picks,
}: {
  strategy: Strategy;
  picks: StrategyPick[];
}) {
  const meta = STRATEGY_META[strategy];

  return (
    <section className={styles.strategySection}>
      <header className={styles.strategyHeader}>
        <div className={styles.strategyAccent} style={{ background: meta.color }} />
        <div>
          <h2>{meta.title}</h2>
          <p>{meta.description}</p>
        </div>
      </header>
      <div className={styles.cardGrid}>
        {picks.map((pick) => (
          <StrategyCard key={pick.symbol} pick={pick} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { data, error, isLoading, mutate } = useSWR<MarketSnapshot>(
    "/api/analyze",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
    }
  );

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <h1>India Equities Trade Scanner</h1>
          <p>
            AI-guided shortlists for intraday, swing, and options strategies
            built on live market data from NSE-listed large and mid-cap stocks.
          </p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={() => mutate()}
          aria-label="Refresh market snapshot"
        >
          Refresh
        </button>
      </header>

      <div className={styles.snapshotMeta}>
        <span>
          {isLoading && "Loading latest market snapshot..."}
          {error && "Unable to load data. Please retry shortly."}
          {data && !isLoading && !error && (
            <>
              Coverage: {data.coverageCount} symbols - Updated{" "}
              {new Date(data.asOf).toLocaleString("en-IN", {
                hour12: false,
                timeZone: "Asia/Kolkata",
              })}
            </>
          )}
        </span>
      </div>

      {data && (
        <div className={styles.strategyGrid}>
          {(
            Object.keys(data.picks) as Strategy[]
          ).map((strategy) => (
            <StrategySection
              key={strategy}
              strategy={strategy}
              picks={data.picks[strategy]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
