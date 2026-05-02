import type { Sector } from './types';

export const OBSTACLE_TEMPLATES: Record<Sector, string[]> = {
  tech: [
    'Regulatory probe into data privacy practices — shares slide 4%',
    'Supply chain chip shortage delays product launch by two quarters',
    'Key engineer exodus sparks talent retention fears',
    'Antitrust lawsuit filed by DOJ over market dominance',
    'Cloud outage impacts 12-hour SLA commitments globally',
    'Patent infringement ruling costs $2B in damages',
    'Cybersecurity breach exposes 50M user records',
    'Ad revenue miss drags stock as macro headwinds bite',
  ],
  finance: [
    'Interest rate hike spooked bond markets — yields spike',
    'Credit default swap spreads widen on recession fears',
    'Regulatory fine of $1.8B for AML compliance failures',
    'Loan loss provisions surge as commercial real estate sours',
    'Trading desk loss erases Q2 gains in single session',
    'Earnings miss — net interest income falls short of estimates',
    'Regional banking contagion fears spread across sector',
    'Leverage ratio breach triggers capital raise at discount',
  ],
  energy: [
    'Crude oil price drop on OPEC+ surprise supply increase',
    'Refinery fire forces two-week production shutdown',
    'Pipeline leak triggers EPA investigation and cleanup costs',
    'Government imposes windfall profit tax on energy sector',
    'Hurricane shuts down Gulf Coast operations for 10 days',
    'OPEC announces production ceiling cut — demand outlook dims',
    'Carbon credit costs rise 30% under new climate framework',
    'Natural gas price collapse erases upstream margins',
  ],
  manufacturing: [
    'Steel tariffs raise input costs by 18% overnight',
    'UAW strike halts factory operations for three weeks',
    'Semiconductor shortage delays delivery of 40,000 units',
    'Recall of 200,000 units over safety defect in core component',
    'Port strike disrupts logistics and export fulfillment',
    'Inflation drives raw material costs above forecast',
    'Key customer cancels $500M order citing budget cuts',
    'Factory fire at main production facility in Ohio',
  ],
};

export const CHEST_TEMPLATES: Record<Sector, string[]> = {
  tech: [
    'Q3 earnings beat analyst estimates by 18% — AI revenue surges',
    'New product launch smashes pre-order records in first 24 hours',
    'Cloud division crosses $100B ARR milestone ahead of schedule',
    'Exclusive government contract worth $4B announced',
    'Breakthrough patent approved — blocks competition for 7 years',
    'Strategic acquisition expands market into Southeast Asia',
    'Developer platform hits 5M monthly active users',
  ],
  finance: [
    'Federal Reserve signals rate pause — bank stocks rally hard',
    'Record M&A advisory fees from three mega-deals close this quarter',
    'Wealth management AUM crosses $1T for the first time',
    'Credit card spending data shows consumer resilience beating forecasts',
    'Dividend raised 12% — signals management confidence in outlook',
    'Buyback program expanded to $25B over next 18 months',
    'Investment banking pipeline strongest in five years',
  ],
  energy: [
    'New deep-water discovery adds 800M barrels to proven reserves',
    'LNG export contract signed with European nation for 15 years',
    'Renewable energy portfolio hits 10GW capacity milestone',
    'Production cost breakthrough reduces lifting cost by $4/barrel',
    'OPEC+ production cut announcement sends crude up 8%',
    'Carbon capture technology reduces ESG penalty, attracts new investors',
    'Dividend yield reaches 7.5% — income investors flood in',
  ],
  manufacturing: [
    'Infrastructure bill passes — $120B allocated to key end markets',
    'Automated factory line boosts output 30% with same headcount',
    'International expansion into India adds $2B addressable market',
    'Record backlog of $45B signals demand strength through 2026',
    'New material sourcing deal cuts input costs by 15%',
    'Government defense contract wins $3B multi-year award',
    'Earnings guidance raised — CEO cites pricing power and efficiency',
  ],
};

export function generateNarratorSummary(
  stock: { company: string; sector: Sector; returnRate: number },
  finalGain: number,
  events: Array<{ type: string }>
): string {
  const direction = finalGain >= 0 ? 'gained' : 'lost';
  const abs = Math.abs(finalGain).toFixed(2);
  const hits = events.filter((e) => e.type === 'obstacle').length;
  const chests = events.filter((e) => e.type === 'chest').length;

  return `${stock.company} navigated a volatile course typical of the ${stock.sector} sector. ` +
    `Your investment ${direction} $${abs} overall — absorbing ${hits} market shock${hits !== 1 ? 's' : ''} ` +
    `and capturing ${chests} opportunity window${chests !== 1 ? 's' : ''} along the way. ` +
    `With a historical return rate of ${stock.returnRate}%, this stock reflects ` +
    `${stock.returnRate > 20 ? 'high growth potential balanced against elevated risk' : 'steady compounding with moderate downside exposure'}. ` +
    `Past performance does not guarantee future results — but understanding the story behind the numbers is where every smart investor begins.`;
}
