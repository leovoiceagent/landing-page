import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * ChatWidget Component - NON-FUNCTIONAL (MISSING DEPENDENCY)
 *
 * This component attempts to load an external chat-widget.js file from the public
 * directory, but that file doesn't exist in the repository. This results in a
 * 404 error and non-functional chat widget.
 *
 * The actual working voice functionality is implemented in VoiceDemo.tsx, which
 * connects directly to Retell AI using their SDK.
 */
const ChatWidget: React.FC = () => {
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChatWidget = () => {
    // Prevent multiple loads
    if (isWidgetLoaded || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Check if we're on the client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      // Set up the widget configuration with SmallBizMarketing webhook
      console.log('Setting up ChatWidgetConfig for SmallBizMarketing...');
      (window as any).ChatWidgetConfig = {
        webhook: {
          url: 'https://leovoiceagent.app.n8n.cloud/webhook/retell',
          route: 'general'
        },
        branding: {
          logo: '/assets/homepageimage.png',
          name: 'Small Biz Marketing Agency',
          welcomeText: 'Hi 👋, how can we help your business grow?',
          responseTimeText: 'We typically respond within minutes'
        },
        style: {
          primaryColor: '#343f61',
          secondaryColor: '#2a3447',
          position: 'right',
          backgroundColor: '#ffffff',
          fontColor: '#333333'
        }
      };

      // Create and inject the script
      const script = document.createElement('script');
      script.src = `/chat-widget.js?v=${Date.now()}`; // Add cache-busting parameter
      script.async = true;
      
      script.onload = () => {
        setIsWidgetLoaded(true);
        setIsLoading(false);
        console.log('SmallBizMarketing chat widget loaded successfully');
        console.log('Chat widget config:', (window as any).ChatWidgetConfig);
        
        // Override the fetch function to add debugging and error handling
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          console.log('Chat widget making request to:', args[0]);
          
          return originalFetch.apply(this, args).then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            // If we get a 404 or HTML response, fall back to demo mode
            if (response.status === 404 || !response.headers.get('content-type')?.includes('application/json')) {
              console.log('API endpoint not found, using demo mode');
              return new Response(JSON.stringify({
                output: "Hello! I'm here to help your small business grow with our local SEO and marketing services. How can I assist you today?"
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            return response;
          }).catch(error => {
            console.error('Fetch error, using demo mode:', error);
            // Return demo response on any error
            return new Response(JSON.stringify({
              output: "Hello! I'm here to help your small business grow with our local SEO and marketing services. How can I assist you today?"
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        };
        
        // Test the webhook connection
        testWebhookConnection();
        
        // Hide the "powered by n8n" branding and customize input height
        setTimeout(() => {
          const style = document.createElement('style');
          style.textContent = `
            /* Hide only specific n8n branding elements */
            [class*="powered"]:not([class*="chat"]), 
            [class*="branding"]:not([class*="chat"]), 
            .n8n-branding,
            .powered-by-n8n {
              display: none !important;
            }
            
            /* Make the chat input box taller but not too tall */
            .chat-input,
            .chat-input textarea,
            .chat-widget input[type="text"],
            .chat-widget textarea,
            [class*="input"] textarea,
            [class*="message-input"] textarea,
            [class*="chat-input"] textarea {
              min-height: 60px !important;
              height: 60px !important;
              max-height: 60px !important;
              resize: none !important;
              padding: 8px 12px !important;
              line-height: 1.4 !important;
            }
            
            /* Target any input area in the chat widget */
            .chat-widget .input-area textarea,
            .chat-widget .message-input textarea,
            .chat-container .input-container textarea {
              min-height: 60px !important;
              height: 60px !important;
              max-height: 60px !important;
            }
          `;
          document.head.appendChild(style);
          console.log('Added targeted CSS to hide n8n branding and increase input height');
        }, 100);
        
        // Debug: Log available window properties and ChatWidgetConfig
        setTimeout(() => {
          try {
            console.log('Available window properties:', Object.keys(window).filter(key => 
              key.toLowerCase().includes('chat') || 
              key.toLowerCase().includes('widget') ||
              key.toLowerCase().includes('n8n')
            ));
            console.log('ChatWidgetConfig:', (window as any).ChatWidgetConfig);
            
            // Auto-open the chat widget by clicking the chat-toggle button
            setTimeout(() => {
              const chatToggleButton = document.querySelector('button.chat-toggle');
              if (chatToggleButton) {
                console.log('Auto-opening chat widget...');
                chatToggleButton.click();
                console.log('Chat widget opened automatically!');
                
                // More careful attempt to hide n8n branding after chat opens
                setTimeout(() => {
                  // Only target elements that are likely to be branding
                  const potentialBranding = document.querySelectorAll('[class*="footer"], [class*="brand"], [class*="powered"]');
                  potentialBranding.forEach(element => {
                    const text = element.textContent || element.innerText || '';
                    if (text.toLowerCase().includes('powered by n8n')) {
                      console.log('Found n8n branding text, hiding:', element);
                      element.style.display = 'none';
                    }
                  });
                }, 500);
              } else {
                console.log('Chat toggle button not found for auto-open');
              }
            }, 500);
            
          } catch (error) {
            console.log('Error in debug logging:', error);
          }
        }, 1000);
      };

      // Function to test webhook connection
      const testWebhookConnection = async () => {
        try {
          console.log('Testing SmallBizMarketing webhook connection...');
          const response = await fetch('https://leovoiceagent.app.n8n.cloud/webhook/retell', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: 'Test connection',
              user: 'test-user',
              timestamp: new Date().toISOString(),
              type: 'chat_message'
            })
          });
          
          console.log('Test response status:', response.status);
          const responseText = await response.text();
          console.log('Test response body:', responseText.substring(0, 500));
        } catch (error) {
          console.error('Test webhook error:', error);
        }
      };

      script.onerror = (error) => {
        setIsLoading(false);
        const errorMessage = 'Failed to load chat widget. Please check your internet connection and try again.';
        setError(errorMessage);
        console.error('Failed to load chat widget:', error);
        console.error('Script URL:', script.src);
      };

      // Append script to document head
      document.head.appendChild(script);

    } catch (error) {
      console.error('Error loading chat widget:', error);
      setIsLoading(false);
      setError('An error occurred while loading the chat widget. Please try again.');
    }
  };

  // Cleanup function to remove script if component unmounts
  useEffect(() => {
    return () => {
      // Clean up any existing chat widget scripts on unmount (both local and CDN versions)
      const existingScripts = document.querySelectorAll('script[src*="chat-widget.js"]');
      existingScripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="inline-block">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        onClick={loadChatWidget}
        disabled={isLoading || isWidgetLoaded}
        className={`
          border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg 
          transition-all duration-300 flex items-center justify-center gap-2
          ${isWidgetLoaded 
            ? 'bg-green-600 border-green-600 cursor-default' 
            : isLoading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-white hover:text-slate-900'
          }
        `}
      >
        <MessageCircle className="h-5 w-5" />
        {isLoading ? 'Loading Chat...' : isWidgetLoaded ? 'Chat Active!' : 'Start Live Chat'}
      </button>
      
    </div>
  );
};

export default ChatWidget;
