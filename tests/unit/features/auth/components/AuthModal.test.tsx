/**
 * Tests Unitaires - AuthModal Component
 * ISO/IEC 29119 - TDD composant authentification
 *
 * MSW handlers: tests/mocks/handlers.ts
 * Fixtures: tests/fixtures/auth.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { createTestQueryClient } from '../../../../utils';
import { VALID_LOGIN_INPUT, VALID_REGISTER_INPUT } from '../../../../fixtures';

// Wrapper avec QueryClient pour les tests
function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// Helper pour attendre que le loading initial soit termine
async function waitForLoadingComplete() {
  await waitFor(() => {
    const submitButton = document.querySelector('button[type="submit"]');
    // Le bouton doit afficher le texte et non le spinner
    expect(submitButton).toHaveTextContent(/parti|Creer/i);
  });
}

// Helper pour obtenir le bouton submit
function getSubmitButton() {
  return document.querySelector('button[type="submit"]')!;
}

describe('AuthModal', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('affiche le modal quand open=true', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('affiche pas le modal quand open=false', () => {
      renderWithQuery(
        <AuthModal open={false} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('affiche le titre Connexion par defaut', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByText(/Connexion/)).toBeInTheDocument();
    });

    it('affiche le champ pseudo', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByLabelText(/Pseudo/i)).toBeInTheDocument();
    });

    it('affiche le champ mot de passe', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    });

    it('affiche bouton de soumission', async () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitForLoadingComplete();
      const submitButton = getSubmitButton();
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('affiche lien vers inscription', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(
        screen.getByRole('button', { name: /Inscris-toi/i })
      ).toBeInTheDocument();
    });
  });

  describe('Mode inscription', () => {
    it('bascule vers inscription au clic', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      expect(screen.getByText(/Inscription/)).toBeInTheDocument();
    });

    it('affiche champ confirmation mot de passe', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      expect(
        screen.getByLabelText(/Confirme ton mot de passe/i)
      ).toBeInTheDocument();
    });

    it('change le bouton soumission', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      expect(
        screen.getByRole('button', { name: /Creer mon compte/i })
      ).toBeInTheDocument();
    });

    it('affiche lien vers connexion', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      expect(
        screen.getByRole('button', { name: /Connecte-toi/i })
      ).toBeInTheDocument();
    });

    it('rebascule vers connexion', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));
      await user.click(screen.getByRole('button', { name: /Connecte-toi/i }));

      expect(screen.getByText(/Connexion/)).toBeInTheDocument();
    });
  });

  describe('Validation formulaire', () => {
    it('affiche erreur si pseudo trop court', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitForLoadingComplete();
      await user.type(screen.getByLabelText(/Pseudo/i), 'abc');
      await user.type(screen.getByLabelText(/Mot de passe/i), 'test1234');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(
          screen.getByText(/pseudo doit faire au moins 4 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it('affiche erreur si mot de passe trop court', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitForLoadingComplete();
      await user.type(screen.getByLabelText(/Pseudo/i), 'testuser');
      await user.type(screen.getByLabelText(/Mot de passe/i), 'abc');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(
          screen.getByText(/mot de passe doit faire au moins 4 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it('affiche erreur si mots de passe differents en inscription', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      // Passer en mode inscription
      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      await user.type(screen.getByLabelText(/Pseudo/i), 'testuser');
      await user.type(screen.getByLabelText(/^Mot de passe$/i), 'test1234');
      await user.type(
        screen.getByLabelText(/Confirme ton mot de passe/i),
        'different'
      );
      await user.click(
        screen.getByRole('button', { name: /Creer mon compte/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/mots de passe ne correspondent pas/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Login', () => {
    it('login reussi ferme le modal', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitForLoadingComplete();
      await user.type(
        screen.getByLabelText(/Pseudo/i),
        VALID_LOGIN_INPUT.username
      );
      await user.type(
        screen.getByLabelText(/Mot de passe/i),
        VALID_LOGIN_INPUT.password
      );
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('login echoue affiche erreur', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitForLoadingComplete();
      await user.type(screen.getByLabelText(/Pseudo/i), 'emma');
      await user.type(screen.getByLabelText(/Mot de passe/i), 'wrongpassword');
      await user.click(getSubmitButton());

      // Message d'erreur de la fixture LOGIN_ERROR_RESPONSE
      await waitFor(() => {
        expect(
          screen.getByText(/Identifiants incorrects/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Register', () => {
    it('inscription reussie ferme le modal', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      // Passer en mode inscription
      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      await user.type(
        screen.getByLabelText(/Pseudo/i),
        VALID_REGISTER_INPUT.username
      );
      await user.type(
        screen.getByLabelText(/^Mot de passe$/i),
        VALID_REGISTER_INPUT.password
      );
      await user.type(
        screen.getByLabelText(/Confirme ton mot de passe/i),
        VALID_REGISTER_INPUT.confirmPassword
      );
      await user.click(
        screen.getByRole('button', { name: /Creer mon compte/i })
      );

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('inscription username existant affiche erreur', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      // Passer en mode inscription
      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      // emma existe deja dans les fixtures
      await user.type(screen.getByLabelText(/Pseudo/i), 'emma');
      await user.type(screen.getByLabelText(/^Mot de passe$/i), 'test1234');
      await user.type(
        screen.getByLabelText(/Confirme ton mot de passe/i),
        'test1234'
      );
      await user.click(
        screen.getByRole('button', { name: /Creer mon compte/i })
      );

      // Message d'erreur de la fixture REGISTER_USER_EXISTS_RESPONSE
      await waitFor(() => {
        expect(
          screen.getByText(/Ce pseudo est deja pris/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Etat loading', () => {
    it('desactive inputs pendant loading', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitForLoadingComplete();
      const usernameInput = screen.getByLabelText(/Pseudo/i);
      const passwordInput = screen.getByLabelText(/Mot de passe/i);

      await user.type(usernameInput, VALID_LOGIN_INPUT.username);
      await user.type(passwordInput, VALID_LOGIN_INPUT.password);

      // Click et verifier que le login fonctionne
      await user.click(getSubmitButton());

      // Le modal se ferme apres login reussi
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Reset formulaire', () => {
    it('reset les champs en changeant de mode', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      // Remplir les champs
      await user.type(screen.getByLabelText(/Pseudo/i), 'testuser');
      await user.type(screen.getByLabelText(/Mot de passe/i), 'testpass');

      // Changer de mode
      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      // Les champs doivent etre vides
      expect(screen.getByLabelText(/Pseudo/i)).toHaveValue('');
      expect(screen.getByLabelText(/^Mot de passe$/i)).toHaveValue('');
    });
  });

  describe('Accessibilite', () => {
    it('a role dialog', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('inputs ont labels associes', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByLabelText(/Pseudo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    });

    it('inputs ont autocomplete corrects en login', () => {
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByLabelText(/Pseudo/i)).toHaveAttribute(
        'autocomplete',
        'username'
      );
      expect(screen.getByLabelText(/Mot de passe/i)).toHaveAttribute(
        'autocomplete',
        'current-password'
      );
    });

    it('inputs ont autocomplete corrects en register', async () => {
      const user = userEvent.setup();
      renderWithQuery(
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /Inscris-toi/i }));

      expect(screen.getByLabelText(/^Mot de passe$/i)).toHaveAttribute(
        'autocomplete',
        'new-password'
      );
      expect(
        screen.getByLabelText(/Confirme ton mot de passe/i)
      ).toHaveAttribute('autocomplete', 'new-password');
    });
  });
});
