import { LoanCreator } from '../components/LoanCreator';
import { StrategyBuilder } from '../components/StrategyBuilder';
import { ActiveStrategies } from '../components/ActiveStrategies';
import { LiFiWidget } from '@lifi/widget';
import { InsuranceLab } from '../components/InsuranceLab';
import { PortfolioManager } from '../components/PortfolioManager';
import { LiquidityPool } from '../components/LiquidityPool';
import type { WidgetConfig } from '@lifi/widget';

export function MintLoan() {
    return (
        <div className="max-w-4xl mx-auto">
            <LoanCreator />
        </div>
    );
}

export function Strategies() {
    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <StrategyBuilder />
            <ActiveStrategies />
        </div>
    );
}

export function Portfolios() {
    return (
        <div className="max-w-6xl mx-auto">
            <PortfolioManager />
        </div>
    );
}

export function Liquidity() {
    return (
        <div className="max-w-5xl mx-auto">
            <LiquidityPool />
        </div>
    );
}

export function Insurance() {
    return (
        <div className="max-w-5xl mx-auto">
            <InsuranceLab />
        </div>
    );
}
