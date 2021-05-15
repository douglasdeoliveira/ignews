import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';

import api from '@services/api';
import getStripeJs from '@services/stripe-js';

import styles from './styles.module.scss';

export default function SubscribeButton() {
	const [session] = useSession();
	const { push } = useRouter();

	async function handleSubscribe() {
		if (!session) {
			signIn('github');
			return;
		}

		if (session?.activeSubscription) {
			push('/posts');
		}

		try {
			const { data } = await api.post<{ sessionId: string }>('/subscribe');

			const stripe = await getStripeJs();

			await stripe.redirectToCheckout({
				sessionId: data.sessionId,
			});
		} catch (error) {
			// eslint-disable-next-line no-alert
			alert(error.message);
		}
	}

	return (
		<button
			type="button"
			className={styles.subscribeButton}
			onClick={handleSubscribe}
		>
			Subscribe now
		</button>
	);
}
