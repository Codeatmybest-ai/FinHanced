export interface CurrencyRate {
  code: string;
  rate: number;
  symbol: string;
  name: string;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}

export class CurrencyService {
  private rates: Map<string, CurrencyRate> = new Map();
  private lastUpdate: Date | null = null;
  private readonly API_KEY = process.env.EXCHANGE_RATE_API_KEY || process.env.CURRENCY_API_KEY || "demo_key";

  constructor() {
    this.initializeDefaultRates();
  }

  private initializeDefaultRates() {
    // Default rates (USD as base)
    const defaultRates: CurrencyRate[] = [
      { code: "USD", rate: 1, symbol: "$", name: "US Dollar" },
      { code: "EUR", rate: 0.85, symbol: "€", name: "Euro" },
      { code: "GBP", rate: 0.73, symbol: "£", name: "British Pound" },
      { code: "JPY", rate: 110, symbol: "¥", name: "Japanese Yen" },
      { code: "CAD", rate: 1.25, symbol: "C$", name: "Canadian Dollar" },
      { code: "AUD", rate: 1.35, symbol: "A$", name: "Australian Dollar" },
      { code: "CHF", rate: 0.92, symbol: "Fr", name: "Swiss Franc" },
      { code: "CNY", rate: 6.45, symbol: "¥", name: "Chinese Yuan" },
    ];

    defaultRates.forEach(rate => {
      this.rates.set(rate.code, rate);
    });
  }

  async updateRates(): Promise<void> {
    try {
      // Use a free currency API
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      
      if (!response.ok) {
        console.warn("Failed to fetch currency rates, using cached rates");
        return;
      }

      const data = await response.json();
      
      // Update rates from API
      Object.entries(data.rates).forEach(([code, rate]) => {
        const existingRate = this.rates.get(code);
        if (existingRate) {
          this.rates.set(code, {
            ...existingRate,
            rate: Number(rate),
          });
        }
      });

      this.lastUpdate = new Date();
    } catch (error) {
      console.error("Currency rate update failed:", error);
    }
  }

  async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<CurrencyConversion> {
    // Update rates if they're older than 1 hour
    if (!this.lastUpdate || Date.now() - this.lastUpdate.getTime() > 3600000) {
      await this.updateRates();
    }

    const fromRate = this.rates.get(fromCurrency);
    const toRate = this.rates.get(toCurrency);

    if (!fromRate || !toRate) {
      throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate.rate;
    const convertedAmount = usdAmount * toRate.rate;
    const rate = toRate.rate / fromRate.rate;

    return {
      from: fromCurrency,
      to: toCurrency,
      amount,
      convertedAmount,
      rate,
    };
  }

  getSupportedCurrencies(): CurrencyRate[] {
    return Array.from(this.rates.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getCurrencySymbol(code: string): string {
    return this.rates.get(code)?.symbol || code;
  }

  formatAmount(amount: number, currency: string): string {
    const rate = this.rates.get(currency);
    if (!rate) return `${amount.toFixed(2)} ${currency}`;

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch {
      return `${rate.symbol}${amount.toFixed(2)}`;
    }
  }
}

export const currencyService = new CurrencyService();
