import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LAST_UPDATED = 'October 14, 2026';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View className="mb-7">
      <Text className="text-lg font-semibold text-[var(--color-ink)] mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-sm leading-6 text-[var(--color-ink-soft)] mb-3">
      {children}
    </Text>
  );
}

function BulletItem({ children }: { children: string }) {
  return (
    <View className="flex-row pl-4 mb-2">
      <Text className="text-sm text-[var(--color-ink-soft)] mr-2">•</Text>
      <Text className="text-sm leading-6 text-[var(--color-ink-soft)] flex-1">
        {children}
      </Text>
    </View>
  );
}

export default function PrivacyPolicyScreenComponent() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[var(--color-app)]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5! pt-6!">
          {/* Header */}
          <Text className="text-2xl font-bold text-[var(--color-ink)] mt-6!">
            Privacy Policy
          </Text>
          <Text className="text-xs text-[var(--color-ink-muted)] mt-2!">
            Last updated: {LAST_UPDATED}
          </Text>
          <Text className="text-sm leading-6 text-[var(--color-ink-soft)] mt-4!">
            This Privacy Policy explains how Banking Management Application
            handles information when you use our application and its
            demonstration banking features.
          </Text>

          {/* Divider */}
          <View className="h-px bg-[var(--color-line)] my-6!" />

          {/* Sections */}
          <Section title="1. About this application">
            <Paragraph>
              Banking Management Application is a software demonstration project
              designed to showcase digital banking workflows and related
              features. It is not a bank, financial institution, or provider of
              regulated financial services.
            </Paragraph>
            <Paragraph>
              Please do not submit real banking passwords, payment card security
              codes, or other sensitive financial information that is not
              necessary for testing the demonstration.
            </Paragraph>
          </Section>

          <Section title="2. Information we may collect">
            <Paragraph>
              Depending on the features you use, the application may process:
            </Paragraph>
            <BulletItem>
              Account information, such as your name, email address, and account
              identifiers.
            </BulletItem>
            <BulletItem>
              Verification information and documents submitted through
              demonstration KYC or KYB workflows.
            </BulletItem>
            <BulletItem>
              Demonstration wallet, card, beneficiary, payout, and transaction
              records.
            </BulletItem>
            <BulletItem>
              Authentication information, including one-time verification codes
              and related account security events.
            </BulletItem>
            <BulletItem>
              Technical information needed to operate, secure, troubleshoot, and
              maintain the application.
            </BulletItem>
          </Section>

          <Section title="3. How we use information">
            <Paragraph>
              Information may be used to create and manage demo accounts, operate
              application features, perform verification workflows, send
              authentication and service emails, maintain security, troubleshoot
              errors, and improve the demonstration.
            </Paragraph>
          </Section>

          <Section title="4. Email delivery and Google API services">
            <Paragraph>
              The application may use the Gmail API to send transactional
              emails, such as one-time verification codes and account-related
              notifications, from a configured sender account to the email
              address associated with the requested action.
            </Paragraph>
            <Paragraph>
              For this purpose, the application uses the authorization granted by
              the configured Gmail account to send messages. The application does
              not need to read the sender's inbox to perform this email-sending
              function.
            </Paragraph>
            <Paragraph>
              Google API data is used only for the disclosed functionality and is
              not sold. Access tokens and refresh tokens should be stored
              securely in server-side environment variables and must not be
              exposed to frontend code or other users.
            </Paragraph>
            <Paragraph>
              The app's use and transfer to any other app of information received
              from Google APIs will adhere to the Google API Services User Data
              Policy, including the Limited Use requirements.
            </Paragraph>
          </Section>

          <Section title="5. Storage and service providers">
            <Paragraph>
              Information may be processed or stored by the infrastructure and
              service providers used to operate the application, such as
              application hosting, databases, file storage, and email delivery
              services. These providers may process information as needed to
              provide their services.
            </Paragraph>
            <Paragraph>
              We take reasonable steps appropriate to this demonstration project
              to protect information. However, no application or method of
              electronic storage can be guaranteed to be completely secure.
            </Paragraph>
          </Section>

          <Section title="6. Sharing of information">
            <Paragraph>
              We do not sell personal information. Information may be processed
              by service providers supporting the application, or disclosed when
              required by applicable law or when necessary to protect the
              application and its users.
            </Paragraph>
          </Section>

          <Section title="7. Data retention and deletion">
            <Paragraph>
              Information may be retained for as long as needed to operate the
              demonstration, maintain records, resolve technical issues, or meet
              applicable legal obligations. Retention periods can depend on the
              data type and the service storing it.
            </Paragraph>
            <Paragraph>
              To ask about access to or deletion of information associated with
              your demo account, contact us using the email address below.
            </Paragraph>
          </Section>

          <Section title="8. Children's privacy">
            <Paragraph>
              This application is a general-purpose software demonstration and
              is not intended to collect personal information from children.
            </Paragraph>
          </Section>

          <Section title="9. Changes to this policy">
            <Paragraph>
              This policy may be updated when the application's functionality or
              data practices change. The latest version and its update date will
              be published on this page.
            </Paragraph>
          </Section>

          <Section title="10. Contact">
            <Paragraph>
              For privacy-related questions about this demonstration
              application, contact:
            </Paragraph>
            <Text className="text-sm text-[var(--color-link)] underline">
              nodemailtesting02@gmail.com
            </Text>
          </Section>

          {/* Footer divider */}
          <View className="h-px bg-[var(--color-line)] mt-4 mb-6" />

          {/* Footer */}
          <CustomButtonComponent
            id="privacyPolicy-return-button"
            label="Return to the application"
            variant="authLink"
            size="sm"
            className="self-start mb-4!"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
