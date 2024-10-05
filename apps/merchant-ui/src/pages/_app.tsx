// Import necessary components and libraries
import { Toaster } from '@/components/ui/toaster';
import { useMerchantStore } from '@/stores/merchantStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useClosedRefundStore, useOpenRefundStore } from '@/stores/refundStore';
import '@/styles/globals.css';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, ReactNode, useEffect, useMemo } from 'react';

// Define the root application component
export default function App({ Component, pageProps }: AppProps) {
  // Access state from various stores using hooks
  const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
  const getOpenRefunds = useOpenRefundStore(state => state.getOpenRefunds);
  const getClosedRefunds = useClosedRefundStore(state => state.getClosedRefunds);
  const getPayments = usePaymentStore(state => state.getPayments);

  // Fetch data on application load
  useEffect(() => {
    getMerchantInfo().catch(console.error);
    getOpenRefunds(0).catch(console.error);
    getClosedRefunds(0).catch(console.error);
    getPayments(0).catch(console.error);
  }, []);

  // Render the application layout
  return (
    <>
      <Head>
        <title>Solana Pay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TooltipProvider>
        <Context>
          <Component {...pageProps} />
          <Toaster />
        </Context>
      </TooltipProvider>
    </>
  );
}

// Define a context component for wallet connection and network configuration
const Context: FC<{ children: ReactNode }> = ({ children }) => {
  // Set the network and endpoint based on the environment
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Define supported wallet adapters
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new PhantomWalletAdapter(),
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          name: 'Solana Pay Merchant Portal',
          uri: 'https://merchant.solanapay.com',
          icon: '/favicon.ico',
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: WalletAdapterNetwork.Mainnet,
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      }),
    ],
    []
  );

  // Provide connection, wallet, and modal context for child components
  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};
