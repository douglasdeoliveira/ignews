import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/dist/client/router';

import styles from './styles.module.scss';

export default function SubscribeButton() {
	const [session] = useSession();
	const router = useRouter();

	async function handleSubscribe() {
		if (!session) {
			signIn('github');
			return;
		}

		if (session.activeSubscription) {
			router.push('/posts');
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
