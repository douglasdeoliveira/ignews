import { query as q } from 'faunadb';

import fauna from '@services/fauna';
import stripe from '@services/stripe';

interface ISaveSubscriptionProps {
	subscriptionId: string;
	customerId: string;
	isCreateAction?: boolean;
}

export const saveSubscription = async ({
	subscriptionId,
	customerId,
	isCreateAction = false,
}: ISaveSubscriptionProps) => {
	const userRef = await fauna.query(
		q.Select(
			'ref',
			q.Get(q.Match(q.Index('user_by_stripe_customer_id'), customerId))
		)
	);

	const subscription = await stripe.subscriptions.retrieve(subscriptionId);

	const subscriptionData = {
		id: subscription.id,
		userId: userRef,
		status: subscription.status,
		price_id: subscription.items.data[0].price.id,
	};

	if (isCreateAction) {
		await fauna.query(
			q.Create(q.Collection('subscriptions'), { data: subscriptionData })
		);
	} else {
		await fauna.query(
			q.Replace(
				q.Select(
					'ref',
					q.Get(q.Match(q.Index('subscription_by_id'), subscriptionId))
				),
				{ data: subscriptionData }
			)
		);
	}
};
