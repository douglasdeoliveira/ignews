import { GetStaticPaths, GetStaticProps } from 'next';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useEffect } from 'react';

import getPrismicClient from '@services/prismic';
import { dateFormatter } from '@services/utils';

import styles from '../post.module.scss';

interface PostPreviewProps {
	post: {
		slug: string;
		title: string;
		content: string;
		updatedAt: string;
	};
}

export default function PostPreview({ post }: PostPreviewProps) {
	const [session] = useSession();
	const { push } = useRouter();

	useEffect(() => {
		if (session?.activeSubscription) {
			push(`/posts/${post.slug}`);
		}
	}, [session, push, post.slug]);

	return (
		<>
			<Head>
				<title>{post.title} | Ignews</title>
			</Head>

			<main className={styles.container}>
				<article className={styles.post}>
					<h1>{post.title}</h1>
					<time>{post.updatedAt}</time>
					<div
						className={`${styles.postContent} ${styles.previewContent}`}
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>

					<div className={styles.continueReading}>
						Wanna continue reading?
						<Link href="/">
							<a>Subscribe now 🤗</a>
						</Link>
					</div>
				</article>
			</main>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: [],
	fallback: 'blocking',
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { slug } = params;

	const prismic = getPrismicClient();

	const response = await prismic.getByUID('post', String(slug), {});

	const post = {
		slug,
		title: RichText.asText(response.data.title),
		content: RichText.asHtml(response.data.content.splice(0, 3)),
		updatedAt: dateFormatter(response.last_publication_date),
	};

	return {
		props: {
			post,
		},
		revalidate: 60 * 30, // 30 minutes
	};
};
