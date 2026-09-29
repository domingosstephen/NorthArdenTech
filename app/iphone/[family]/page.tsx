/* Step 5 — Product / buy page /iphone/[family]. Built in build step 5. */
export default async function ProductPage(props: PageProps<"/iphone/[family]">) {
  const { family } = await props.params;
  return (
    <main>
      <h1>Buy {family}</h1>
      <p>Coming in step 5.</p>
    </main>
  );
}
